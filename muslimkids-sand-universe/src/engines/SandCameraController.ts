// SandCameraController — smooth cinematic camera from keyframes.
// Position, look-at target and FOV are interpolated with cubic Hermite
// splines (Catmull-Rom tangents for non-uniform key times), so the camera
// never jerks: velocity stays continuous through every keyframe.
export type CameraKey = {t: number; pos: [number, number, number]; target: [number, number, number]; fov?: number; hold?: boolean};
export type CameraPose = {pos: [number, number, number]; target: [number, number, number]; fov: number};

export class SandCameraController {
	keys: CameraKey[] = [];
	defaultFov = 35;

	add(...keys: CameraKey[]) {
		this.keys.push(...keys);
		this.keys.sort((a, b) => a.t - b.t);
		return this;
	}

	private channel(get: (k: CameraKey) => number, t: number) {
		const K = this.keys;
		if (t <= K[0].t) return get(K[0]);
		if (t >= K[K.length - 1].t) return get(K[K.length - 1]);
		let i = 0;
		while (K[i + 1].t < t) i++;
		const a = K[i];
		const b = K[i + 1];
		const h = b.t - a.t;
		const slope = (k0: CameraKey, k1: CameraKey) => (get(k1) - get(k0)) / (k1.t - k0.t);
		const tangent = (j: number) => {
			const k = K[j];
			if (k.hold || j === 0 || j === K.length - 1) return 0;
			const s0 = slope(K[j - 1], k);
			const s1 = slope(k, K[j + 1]);
			// Avoid overshoot when the motion reverses direction.
			if (s0 * s1 <= 0) return 0;
			return (s0 + s1) / 2;
		};
		// Fritsch–Carlson limiter: no overshoot inside a monotone segment.
		const delta = get(b) - get(a);
		const limit = (m: number) => (delta === 0 ? 0 : m * delta < 0 ? 0 : Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(delta)));
		const m0 = limit(tangent(i) * h);
		const m1 = limit(tangent(i + 1) * h);
		const s = (t - a.t) / h;
		const s2 = s * s;
		const s3 = s2 * s;
		return (2 * s3 - 3 * s2 + 1) * get(a) + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * get(b) + (s3 - s2) * m1;
	}

	pose(t: number): CameraPose {
		const p = (c: number) => this.channel((k) => k.pos[c], t);
		const q = (c: number) => this.channel((k) => k.target[c], t);
		return {pos: [p(0), p(1), p(2)], target: [q(0), q(1), q(2)], fov: this.channel((k) => k.fov ?? this.defaultFov, t)};
	}
}
