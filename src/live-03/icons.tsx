// Простые иконки BalaGoLive03 (SVG, фирменные цвета).
import { NAVY, WA_GREEN, WHITE, YELLOW } from "./ui";

type P = { readonly size: number; readonly color?: string };

export const CalendarIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect x="5" y="9" width="38" height="34" rx="7" fill="none" stroke={color} strokeWidth="4" />
    <path d="M5 19h38" stroke={color} strokeWidth="4" />
    <path d="M15 5v8M33 5v8" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <rect x="13" y="25" width="7" height="6" rx="1.5" fill={color} />
    <rect x="28" y="25" width="7" height="6" rx="1.5" fill={YELLOW} />
  </svg>
);

export const MeetingIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="16" cy="16" r="7" fill={color} />
    <circle cx="33" cy="17" r="6" fill={color} opacity="0.7" />
    <path d="M3 41c0-8 6-13 13-13s13 5 13 13Z" fill={color} />
    <path d="M27 40c0-6 3-10 7-11 6 0 11 4 11 11Z" fill={color} opacity="0.7" />
  </svg>
);

export const BriefcaseIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect x="4" y="14" width="40" height="28" rx="6" fill={color} />
    <path d="M17 14v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" fill="none" stroke={color} strokeWidth="4" />
    <rect x="4" y="24" width="40" height="4" fill={WHITE} opacity="0.35" />
    <rect x="20" y="22" width="8" height="8" rx="2" fill={YELLOW} />
  </svg>
);

export const TasksIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect x="7" y="5" width="34" height="40" rx="6" fill="none" stroke={color} strokeWidth="4" />
    <path d="M14 17h20M14 26h20M14 35h12" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const SchoolIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 4 44 15H4Z" fill={color} />
    <rect x="7" y="16" width="34" height="26" rx="2" fill={color} />
    <rect x="20" y="28" width="8" height="14" fill={YELLOW} />
    <rect x="11" y="21" width="6" height="6" rx="1" fill={WHITE} />
    <rect x="31" y="21" width="6" height="6" rx="1" fill={WHITE} />
  </svg>
);

export const HouseIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 5 44 22h-5v20H9V22H4Z" fill={color} />
    <rect x="20" y="29" width="8" height="13" rx="1.5" fill={YELLOW} />
  </svg>
);

export const PauseIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="21" fill={color} />
    <rect x="16" y="14" width="5.5" height="20" rx="2" fill={WHITE} />
    <rect x="26.5" y="14" width="5.5" height="20" rx="2" fill={WHITE} />
  </svg>
);

export const CheckIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="21" fill={color} />
    <path d="m14 25 7 7 13-15" fill="none" stroke={WHITE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PinIcon: React.FC<P> = ({ size, color = YELLOW }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 3c-8.8 0-15 6.6-15 15 0 11 15 27 15 27s15-16 15-27c0-8.4-6.2-15-15-15Z" fill={color} />
    <circle cx="24" cy="18" r="6" fill={NAVY} />
  </svg>
);

export const WhatsAppIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 3a21 21 0 0 0-18 31.6L3 45l10.8-2.9A21 21 0 1 0 24 3Z" fill={WA_GREEN} />
    <path
      d="M17.3 13.5c-.5-1.1-1-1.1-1.5-1.1h-1.3c-.4 0-1.2.2-1.8.8-.6.7-2.3 2.3-2.3 5.5s2.4 6.4 2.7 6.8c.3.5 4.6 7.4 11.4 10 5.6 2.2 6.8 1.8 8 1.7 1.2-.1 4-1.6 4.5-3.2.6-1.6.6-2.9.4-3.2-.2-.3-.6-.5-1.3-.8l-4.4-2.2c-.6-.2-1-.3-1.5.3l-2 2.5c-.4.4-.7.5-1.4.2-.6-.3-2.7-1-5.1-3.2-1.9-1.7-3.2-3.8-3.6-4.4-.4-.6 0-1 .3-1.3l1-1.1c.3-.4.4-.7.6-1.1.2-.4.1-.8 0-1.1l-2-5.1Z"
      fill={WHITE}
    />
  </svg>
);

export const ArrowUpIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 6 40 24H30v18H18V24H8Z" fill={color} />
  </svg>
);

export const CarIcon: React.FC<P> = ({ size, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M5 30v-6l5-9a4 4 0 0 1 3.5-2h21a4 4 0 0 1 3.5 2l5 9v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" fill={color} />
    <path d="M12 23l3.5-6.5h17L36 23Z" fill={WHITE} opacity="0.9" />
    <circle cx="14" cy="34" r="5" fill={color} stroke={WHITE} strokeWidth="2.5" />
    <circle cx="34" cy="34" r="5" fill={color} stroke={WHITE} strokeWidth="2.5" />
  </svg>
);
