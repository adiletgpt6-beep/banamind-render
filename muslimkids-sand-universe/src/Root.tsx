import React from 'react';
import {Composition} from 'remotion';
import {SandUniverseFilm} from './compositions/SandUniverseFilm';
import timeline from './timeline.json';

const {fps, width, height, durationInFrames} = timeline;

// Short test renders for the technical checks (preview resolution).
const TESTS: [string, number, number][] = [
	['SandTestA-Macro', 0, 6],
	['SandTestB-Assembly', 5.5, 6],
	['SandTestC-Disintegration', 13.2, 7.5],
	['SandTestD-Reformation', 22.6, 11],
	['SandTestE-Grand', 43.2, 9.5],
];

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="MuslimKidsSandUniverse014"
			component={SandUniverseFilm}
			durationInFrames={durationInFrames}
			fps={fps}
			width={width}
			height={height}
			defaultProps={{startSec: 0, withAudio: true}}
		/>
		<Composition
			id="MuslimKidsSandUniverse014-Preview540"
			component={SandUniverseFilm}
			durationInFrames={durationInFrames}
			fps={fps}
			width={540}
			height={960}
			defaultProps={{startSec: 0, withAudio: true}}
		/>
		{TESTS.map(([id, start, dur]) => (
			<Composition
				key={id}
				id={id}
				component={SandUniverseFilm}
				durationInFrames={Math.round(dur * fps)}
				fps={fps}
				width={540}
				height={960}
				defaultProps={{startSec: start, withAudio: false}}
			/>
		))}
	</>
);
