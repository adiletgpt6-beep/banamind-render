// План 7 (27,10–34,51 с) и фирменный финал.
//   • «Эгер сизге да ушундай кызмат керек болсо» — заголовок по словам;
//   • «профилдеги шилтемеге өтүңүз» — выезжает контактный блок: город и
//     ссылка в профиле; «же … WhatsApp номерге» — крупный номер;
//   • после последнего слова кадр уходит в портрет на фирменной карточке,
//     звучит бренд-реплика с городом; контакты стоят неподвижно до конца.
import { Img, staticFile } from "remotion";
import { ContactDock } from "../../live/ContactDock";
import { fontFamily } from "../../fonts";
import { CheckIcon } from "../../live/icons";
import { KineticTitle } from "../../live/KineticTitle";
import { easeOut, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { Glow } from "../../live/ui";
import { LIVE04_CONTACTS } from "../brand";
import { CUE, LIVE04 } from "../cues";

// Фон фирменной карточки — виден, когда кадр отъезжает (неделя, финал).
export const Backdrop: React.FC = () => {
  const t = useT();
  const drift = t * 6;
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 70% 22%, #22448C 0%, ${C.navyDeep} 48%, ${C.navyInk} 100%)` }}>
      {/* мягкие лучи */}
      <div
        style={{
          position: "absolute",
          inset: -200,
          background: `conic-gradient(from ${200 + drift * 0.5}deg at 72% 18%, rgba(255,201,14,0) 0deg, rgba(255,201,14,0.08) 18deg, rgba(255,201,14,0) 40deg, rgba(79,139,255,0.08) 70deg, rgba(255,201,14,0) 100deg, rgba(255,201,14,0.06) 150deg, rgba(255,201,14,0) 190deg)`,
        }}
      />
      {/* точечная сетка «города» */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
        {Array.from({ length: 22 }, (_, r) =>
          Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={c * 96 + 30 + (r % 2) * 48} cy={((r * 92 + drift * 4) % 2024) - 50} r={3} fill="#8FB0FF" />),
        )}
      </svg>
    </div>
  );
};

const BrandSide: React.FC<{ readonly t: number }> = ({ t }) => {
  const at = CUE.lastWordEnd + 0.3;
  const logo = springy(t, at, 0.6);
  const word = ramp(t, at + 0.2, 0.35, easeOut);
  const chip = springy(t, at + 0.45, 0.5);
  if (logo <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 500, top: 270, width: 430, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ position: "relative", width: 250, height: 250, transform: `scale(${logo}) rotate(${(1 - logo) * 30}deg)` }}>
        <Glow size={460} opacity={0.5} style={{ left: -105, top: -105 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: C.white, boxShadow: "0 30px 70px rgba(0,0,0,0.5), 0 0 0 7px rgba(255,201,14,0.95)" }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </div>
      <div style={{ fontFamily, fontWeight: 1000, fontSize: 112, lineHeight: 0.95, color: C.white, opacity: word, transform: `translateY(${(1 - word) * 30}px)` }}>
        Bala<span style={{ color: C.yellow }}>Go</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.1)",
          border: "2px solid rgba(255,255,255,0.2)",
          fontFamily,
          fontWeight: 900,
          fontSize: 34,
          color: C.white,
          whiteSpace: "nowrap",
          transform: `scale(${chip})`,
        }}
      >
        Үй → Мектеп → Үй <CheckIcon size={40} />
      </div>
    </div>
  );
};

export const Cta: React.FC = () => {
  const t = useT();
  if (t < LIVE04.cuts[5] - 0.05) return null;
  return (
    <>
      <KineticTitle
        y={930}
        size={84}
        out={CUE.profil - 0.25}
        lines={[
          [
            { text: "Сизге", at: CUE.sizge },
            { text: "да", at: CUE.da },
          ],
          [
            { text: "ушундай", at: CUE.ushunday },
            { text: "кызмат", at: CUE.kyzmat, accent: "yellow" },
          ],
          [
            { text: "керек", at: CUE.kerek2 },
            { text: "болсо", at: CUE.bolso },
          ],
        ]}
      />
      <BrandSide t={t} />
      <ContactDock
        t={t}
        texts={LIVE04_CONTACTS}
        cityAt={CUE.profil - 0.15}
        profileAt={CUE.profil}
        orAt={CUE.zhe}
        phoneAt={CUE.whatsapp}
        pulseAt={CUE.lastWordEnd + 0.6}
      />
    </>
  );
};
