// Typography — every text layer of the film. Text is never made of sand:
// labels, the Quran quote and the end card are crisp, static HTML layers
// that only fade in/out as a whole.
import React from 'react';
import {interpolate} from 'remotion';
import timeline from '../timeline.json';

export const FONT = 'Nunito, "DejaVu Sans", sans-serif';
const GOLD = '#E8C88C';
const SAND = '#F0E0C4';
const WHITE = '#F8F5ED';

const fade = (t: number, a: number, b: number, fin = 0.5, fout = 0.5) =>
	interpolate(t, [a, a + fin, b - fout, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Label: React.FC<{text: string; sub: string; x: number; y: number; dir: 1 | -1; opacity: number; k: number; tone: string}> = ({text, sub, x, y, dir, opacity, k, tone}) => (
	<div style={{position: 'absolute', left: x * k, top: y * k, transform: 'translate(-50%, -50%)', opacity, textAlign: 'center', fontFamily: FONT}}>
		<div style={{fontSize: 54 * k, fontWeight: 800, letterSpacing: `${0.18}em`, color: tone, textShadow: `0 ${2 * k}px ${14 * k}px rgba(4,10,20,0.85)`}}>{text}</div>
		<div style={{fontSize: 26 * k, fontWeight: 600, letterSpacing: '0.06em', color: SAND, opacity: 0.85, marginTop: 4 * k, textShadow: `0 ${2 * k}px ${10 * k}px rgba(4,10,20,0.85)`}}>{sub}</div>
		<svg width={140 * k} height={110 * k} style={{position: 'absolute', left: '50%', top: '100%', marginLeft: dir === 1 ? -40 * k : -100 * k, overflow: 'visible'}}>
			<path d={dir === 1 ? `M ${40 * k} ${8 * k} q ${10 * k} ${50 * k} ${-20 * k} ${92 * k}` : `M ${100 * k} ${8 * k} q ${-10 * k} ${50 * k} ${20 * k} ${92 * k}`} stroke={tone} strokeWidth={3 * k} fill="none" strokeLinecap="round" opacity={0.8} />
			<circle cx={dir === 1 ? 20 * k : 120 * k} cy={100 * k} r={6 * k} fill={tone} />
		</svg>
	</div>
);

export const DayNightLabels: React.FC<{t: number; k: number}> = ({t, k}) => {
	const [d0, d1] = timeline.labels.day;
	const [n0, n1] = timeline.labels.night;
	return (
		<>
			<Label text="ДЕНЬ" sub="сторона к Солнцу" x={800} y={300} dir={-1} opacity={fade(t, d0, d1, 0.6, 0.5)} k={k} tone="#FFE1A6" />
			<Label text="НОЧЬ" sub="сторона в тени" x={290} y={300} dir={1} opacity={fade(t, n0, n1, 0.6, 0.5)} k={k} tone="#A9C9F0" />
		</>
	);
};

export const QuranQuote: React.FC<{t: number; k: number}> = ({t, k}) => {
	const [a, b] = timeline.quote;
	const o = fade(t, a, b, 0.8, 0.5);
	if (o <= 0) return null;
	const line: React.CSSProperties = {fontSize: 86 * k, fontWeight: 800, lineHeight: 1.16, color: WHITE, letterSpacing: '0.02em', textShadow: `0 ${3 * k}px ${18 * k}px rgba(3,9,18,0.9)`};
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, fontFamily: FONT}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 560 * k, height: 760 * k, background: 'radial-gradient(ellipse 62% 50% at 50% 50%, rgba(6,16,30,0.82) 0%, rgba(6,16,30,0.55) 55%, rgba(6,16,30,0) 100%)'}} />
			<div style={{position: 'absolute', left: 90 * k, right: 90 * k, top: 690 * k, textAlign: 'center'}}>
				<div style={{width: 120 * k, height: 3 * k, background: GOLD, margin: `0 auto ${34 * k}px`, borderRadius: 2 * k}} />
				<div style={line}>ГОСПОДЬ НАШ!</div>
				<div style={line}>ТЫ НЕ СОТВОРИЛ</div>
				<div style={line}>ЭТО ПОНАПРАСНУ</div>
				<div style={{width: 120 * k, height: 3 * k, background: GOLD, margin: `${34 * k}px auto ${26 * k}px`, borderRadius: 2 * k}} />
				<div style={{fontSize: 38 * k, fontWeight: 700, color: GOLD, letterSpacing: '0.02em'}}>Сура «Аль-Имран», 3:191</div>
				<div style={{fontSize: 30 * k, fontWeight: 600, color: SAND, opacity: 0.88, marginTop: 8 * k}}>Часть аята. Перевод смысла</div>
			</div>
		</div>
	);
};

export const EndCard: React.FC<{t: number; k: number}> = ({t, k}) => {
	const [a] = timeline.logo;
	const o = interpolate(t, [a, a + 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: o, fontFamily: FONT, textAlign: 'center'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 640 * k, height: 560 * k, background: 'radial-gradient(ellipse 60% 48% at 50% 50%, rgba(6,16,30,0.78) 0%, rgba(6,16,30,0.4) 60%, rgba(6,16,30,0) 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 820 * k}}>
				<div
					style={{
						fontSize: 112 * k,
						fontWeight: 900,
						letterSpacing: '0.1em',
						marginLeft: '0.1em',
						background: `linear-gradient(180deg, ${SAND} 10%, ${GOLD} 60%, #D9B57B 100%)`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						filter: `drop-shadow(0 ${4 * k}px ${16 * k}px rgba(3,9,18,0.85))`,
					}}
				>
					MUSLIM KIDS
				</div>
				<div style={{width: 90 * k, height: 3 * k, background: GOLD, margin: `${22 * k}px auto`, borderRadius: 2 * k}} />
				<div style={{fontSize: 40 * k, fontWeight: 700, letterSpacing: '0.2em', marginLeft: '0.2em', color: WHITE, opacity: 0.92, textShadow: `0 ${2 * k}px ${12 * k}px rgba(3,9,18,0.9)`}}>
					РАЗМЫШЛЯЙ О ТВОРЕНИИ
				</div>
			</div>
		</div>
	);
};
