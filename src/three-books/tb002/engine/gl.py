"""Headless OpenGL renderer for glowing particles (moderngl + EGL, works on llvmpipe).

One frame = background (gradient, grid, light/dark mix) + particles (round cores with soft
halo, additive) + bloom + text/overlay layers (premultiplied RGBA textures)."""
import numpy as np
import moderngl

W, H = 1920, 1080

PARTICLE_VS = """
#version 330
in vec2 pos; in float size; in vec4 col;
uniform vec2 res;
out vec4 v_col; out float v_size;
void main(){
  vec2 ndc = vec2(pos.x / res.x * 2.0 - 1.0, 1.0 - pos.y / res.y * 2.0);
  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = size * 3.0 + 2.0;
  v_col = col; v_size = size;
}"""
PARTICLE_FS = """
#version 330
in vec4 v_col; in float v_size;
uniform float halo;
out vec4 frag;
void main(){
  float spr = v_size * 3.0 + 2.0;
  float d = length(gl_PointCoord - 0.5) * spr;      // distance in px from centre
  float r = v_size * 0.5;
  float core = clamp(r + 0.6 - d, 0.0, 1.0);        // antialiased disk
  float glow = exp(-d * d / (r * r * 2.2 + 1.0)) * halo;
  float a = v_col.a;
  frag = vec4(v_col.rgb * a * (core + glow), a * core);
}"""
QUAD_VS = """
#version 330
in vec2 in_pos; out vec2 uv;
void main(){ uv = in_pos * 0.5 + 0.5; gl_Position = vec4(in_pos, 0.0, 1.0); }"""
BLUR_FS = """
#version 330
in vec2 uv; uniform sampler2D tex; uniform vec2 dir; out vec4 frag;
void main(){
  float w[5] = float[](0.227, 0.194, 0.121, 0.054, 0.016);
  vec4 s = texture(tex, uv) * w[0];
  for (int i = 1; i < 5; i++) { s += texture(tex, uv + dir * float(i)) * w[i];
                                s += texture(tex, uv - dir * float(i)) * w[i]; }
  frag = s;
}"""
COMPOSITE_FS = """
#version 330
in vec2 uv; out vec4 frag;
uniform sampler2D acc; uniform sampler2D bloom;
uniform vec2 res; uniform float light; uniform float bloom_k; uniform float grid_k;
uniform vec3 bg_a; uniform vec3 bg_b; uniform vec3 tint; uniform float tint_k; uniform vec2 cam; uniform float cam_z;
void main(){
  vec2 px = vec2(uv.x * res.x, (1.0 - uv.y) * res.y);
  // dark background: deep blue -> violet diagonal + soft centre glow
  float g = clamp(0.35 * uv.x + 0.65 * (1.0 - uv.y), 0.0, 1.0);
  vec3 dark = mix(bg_a, bg_b, g);
  float rc = length((px - res * 0.5) / res.y);
  dark += tint * tint_k * exp(-rc * rc * 3.0);
  dark *= 1.0 - 0.35 * smoothstep(0.45, 1.05, rc);
  vec3 lite = mix(vec3(0.957, 0.961, 0.988), vec3(0.918, 0.925, 0.976), g);
  vec3 bg = mix(dark, lite, light);
  // thin grid that moves with the camera
  vec2 gp = (px - res * 0.5) / cam_z + cam;
  vec2 f = abs(fract(gp / 64.0 + 0.5) - 0.5) * 64.0 * cam_z;
  float line = (1.0 - smoothstep(0.0, 1.1, min(f.x, f.y)));
  vec3 gcol = mix(vec3(0.42, 0.49, 1.0), vec3(0.45, 0.48, 0.70), light);
  bg = mix(bg, gcol, line * grid_k * mix(0.075, 0.10, light));
  vec4 a = texture(acc, uv);
  vec3 b = texture(bloom, uv).rgb;
  vec3 darkc = bg + a.rgb + b * bloom_k;
  darkc = darkc / (1.0 + max(darkc - 1.0, 0.0) * 0.6);   // soft shoulder
  float cov = clamp(a.a * 1.8, 0.0, 1.0);
  vec3 ink = a.rgb / max(a.a, 0.12);
  ink = ink * 0.74;                                       // deeper, saturated ink on white
  vec3 litec = mix(bg, ink, cov) + b * bloom_k * 0.12;
  frag = vec4(clamp(mix(darkc, litec, light), 0.0, 1.0), 1.0);
}"""
OVERLAY_FS = """
#version 330
in vec2 uv; out vec4 frag; uniform sampler2D tex; uniform float alpha;
void main(){ vec4 c = texture(tex, vec2(uv.x, 1.0 - uv.y)); frag = c * alpha; }"""


class Renderer:
    def __init__(self, w=W, h=H):
        self.w, self.h = w, h
        self.ctx = moderngl.create_standalone_context(backend="egl")
        ctx = self.ctx
        ctx.enable(moderngl.PROGRAM_POINT_SIZE)
        self.p_prog = ctx.program(vertex_shader=PARTICLE_VS, fragment_shader=PARTICLE_FS)
        self.blur = ctx.program(vertex_shader=QUAD_VS, fragment_shader=BLUR_FS)
        self.comp = ctx.program(vertex_shader=QUAD_VS, fragment_shader=COMPOSITE_FS)
        self.ovl = ctx.program(vertex_shader=QUAD_VS, fragment_shader=OVERLAY_FS)
        quad = ctx.buffer(np.array([-1, -1, 1, -1, -1, 1, 1, 1], "f4").tobytes())
        self.q_blur = ctx.vertex_array(self.blur, [(quad, "2f", "in_pos")])
        self.q_comp = ctx.vertex_array(self.comp, [(quad, "2f", "in_pos")])
        self.q_ovl = ctx.vertex_array(self.ovl, [(quad, "2f", "in_pos")])
        self.acc_t = ctx.texture((w, h), 4, dtype="f2")
        self.acc = ctx.framebuffer([self.acc_t])
        bw, bh = w // 4, h // 4
        self.b1_t = ctx.texture((bw, bh), 4, dtype="f2")
        self.b2_t = ctx.texture((bw, bh), 4, dtype="f2")
        for t in (self.acc_t, self.b1_t, self.b2_t):
            t.filter = (moderngl.LINEAR, moderngl.LINEAR)
            t.repeat_x = t.repeat_y = False
        self.b1 = ctx.framebuffer([self.b1_t])
        self.b2 = ctx.framebuffer([self.b2_t])
        self.out_t = ctx.texture((w, h), 3)
        self.out = ctx.framebuffer([self.out_t])
        self.cap = 0
        self.vbo = None
        self.vao = None
        self.ovl_tex = ctx.texture((w, h), 4)
        self.ovl_tex.filter = (moderngl.LINEAR, moderngl.LINEAR)

    def _ensure(self, n):
        if n <= self.cap:
            return
        self.cap = max(n, int(self.cap * 1.5), 4096)
        if self.vbo:
            self.vbo.release()
            self.vao.release()
        self.vbo = self.ctx.buffer(reserve=self.cap * 8 * 4)
        self.vao = self.ctx.vertex_array(self.p_prog, [(self.vbo, "2f 1f 4f 1x4", "pos", "size", "col")])

    def frame(self, pts, light=0.0, bloom=0.55, halo=0.35, grid=1.0, overlay=None,
              bg_a=(0.027, 0.067, 0.122), bg_b=(0.102, 0.043, 0.220), tint=(0.25, 0.2, 0.6), tint_k=0.25,
              cam=(0.0, 0.0), cam_z=1.0):
        """pts: float32 array (N, 7): x, y, size, r, g, b, a (screen px, colours 0..1).
        overlay: uint8 RGBA (h, w, 4) premultiplied, drawn last (text)."""
        ctx = self.ctx
        n = 0 if pts is None else len(pts)
        self.acc.use()
        self.acc.clear(0, 0, 0, 0)
        if n:
            self._ensure(n)
            data = np.zeros((n, 8), "f4")
            data[:, :7] = pts
            self.vbo.write(data.tobytes())
            ctx.enable(moderngl.BLEND)
            ctx.blend_func = moderngl.ONE, moderngl.ONE
            self.p_prog["res"].value = (self.w, self.h)
            self.p_prog["halo"].value = halo
            self.vao.render(moderngl.POINTS, vertices=n)
            ctx.disable(moderngl.BLEND)
        # bloom: downsample + separable blur
        bw, bh = self.w // 4, self.h // 4
        self.b1.use()
        self.acc_t.use(0)
        self.blur["tex"].value = 0
        self.blur["dir"].value = (1.5 / bw, 0.0)
        self.q_blur.render(moderngl.TRIANGLE_STRIP)
        self.b2.use()
        self.b1_t.use(0)
        self.blur["dir"].value = (0.0, 1.5 / bh)
        self.q_blur.render(moderngl.TRIANGLE_STRIP)
        self.b1.use()
        self.b2_t.use(0)
        self.blur["dir"].value = (3.0 / bw, 0.0)
        self.q_blur.render(moderngl.TRIANGLE_STRIP)
        self.b2.use()
        self.b1_t.use(0)
        self.blur["dir"].value = (0.0, 3.0 / bh)
        self.q_blur.render(moderngl.TRIANGLE_STRIP)
        # composite
        self.out.use()
        self.acc_t.use(0)
        self.b2_t.use(1)
        c = self.comp
        c["acc"].value = 0
        c["bloom"].value = 1
        c["res"].value = (self.w, self.h)
        c["light"].value = float(light)
        c["bloom_k"].value = float(bloom)
        c["grid_k"].value = float(grid)
        c["bg_a"].value = tuple(bg_a)
        c["bg_b"].value = tuple(bg_b)
        c["tint"].value = tuple(tint)
        c["tint_k"].value = float(tint_k)
        c["cam"].value = tuple(cam)
        c["cam_z"].value = float(cam_z)
        self.q_comp.render(moderngl.TRIANGLE_STRIP)
        if overlay is not None:
            self.ovl_tex.write(overlay.tobytes())
            ctx.enable(moderngl.BLEND)
            ctx.blend_func = moderngl.ONE, moderngl.ONE_MINUS_SRC_ALPHA
            self.ovl_tex.use(0)
            self.ovl["tex"].value = 0
            self.ovl["alpha"].value = 1.0
            self.q_ovl.render(moderngl.TRIANGLE_STRIP)
            ctx.disable(moderngl.BLEND)
        return self.out.read(components=3, alignment=1)  # bottom-up rows


if __name__ == "__main__":
    import time
    r = Renderer()
    rng = np.random.default_rng(1)
    N = 30000
    pts = np.zeros((N, 7), "f4")
    pts[:, 0] = rng.uniform(300, 1600, N)
    pts[:, 1] = rng.uniform(200, 900, N)
    pts[:, 2] = rng.uniform(2.5, 6, N)
    pts[:, 3:6] = rng.uniform(0.2, 1, (N, 3))
    pts[:, 6] = 0.8
    ov = np.zeros((H, W, 4), np.uint8)
    t = time.time()
    for i in range(20):
        pts[:, 0] += 1
        buf = r.frame(pts, overlay=ov)
    print("ms/frame", (time.time() - t) / 20 * 1000, len(buf))
    from PIL import Image
    Image.frombytes("RGB", (W, H), buf).transpose(Image.FLIP_TOP_BOTTOM).save("/tmp/claude-0/bench.png")
