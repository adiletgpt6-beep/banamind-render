import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {SandRenderer} from '../components/SandRenderer';
import {DayNightLabels, EndCard, QuranQuote} from '../components/Typography';
import {SandUniverseEngine} from '../engines/SandUniverseEngine';

let enginePromise: Promise<SandUniverseEngine> | null = null;
const loadEngine = () =>
	(enginePromise ??= fetch(staticFile('assets/land-mask-1024x512.bin'))
		.then((r) => r.arrayBuffer())
		.then((b) => new SandUniverseEngine(new Uint8Array(b))));

let fontPromise: Promise<void> | null = null;
const loadFont = () =>
	(fontPromise ??= new FontFace('Nunito', `url(${staticFile('fonts/Nunito-Variable.ttf')})`, {weight: '200 1000'}).load().then((f) => {
		(document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
	}));

export type FilmProps = {startSec: number; withAudio: boolean};

export const SandUniverseFilm: React.FC<FilmProps> = ({startSec, withAudio}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const [handle] = useState(() => delayRender('Building the sand universe', {timeoutInMilliseconds: 900000}));
	const [engine, setEngine] = useState<SandUniverseEngine | null>(null);
	useEffect(() => {
		Promise.all([loadEngine(), loadFont()])
			.then(([e]) => {
				setEngine(e);
				continueRender(handle);
			})
			.catch((err) => cancelRender(err));
	}, [handle]);
	const t = startSec + frame / fps;
	const k = width / 1080;
	const light = engine?.ctx.lights.at(t);
	const bg = light
		? `radial-gradient(ellipse 120% 70% at 50% 18%, ${light.bgTop} 0%, ${light.bgMid} 55%, ${light.bgBottom} 100%)`
		: '#081525';
	return (
		<AbsoluteFill style={{background: bg}}>
			{engine ? <SandRenderer engine={engine} time={t} width={width} height={height} /> : null}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0,0,0,0) 60%, rgba(2,6,12,0.42) 100%)'}} />
			<DayNightLabels t={t} k={k} />
			<QuranQuote t={t} k={k} />
			<EndCard t={t} k={k} />
			{withAudio ? <Html5Audio src={staticFile('audio/mix.wav')} /> : null}
		</AbsoluteFill>
	);
};
