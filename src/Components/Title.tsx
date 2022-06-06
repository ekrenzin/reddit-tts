import { useCallback, useEffect, useState } from 'react';
import {
	Audio,
	continueRender,
	delayRender,
	useCurrentFrame,
	interpolate,
	Sequence
} from 'remotion';
import { Banner } from './Banner';
export const Title: React.FC<{
	titleText: string;
	url: string;
	startFrame: number;
	endFrame: number;
}> = ({ titleText, url, startFrame, endFrame }) => {
	const frame = useCurrentFrame();
	const [handle] = useState(() => delayRender());
	const [audioUrl, setAudioUrl] = useState('');

	const opacity = interpolate(frame, [0, 40], [0, 1], {
		extrapolateRight: "clamp",
	});

	const fetchTts = useCallback(async () => {
		setAudioUrl(url);
		continueRender(handle);
	}, [handle, titleText]);

	useEffect(() => {
		fetchTts();

	}, [fetchTts]);


	if (frame > startFrame && frame < endFrame) {
		return (
			<Sequence from={0}>
				<Banner />
				{audioUrl ? <Audio src={audioUrl} /> : <></>}
				<div
					style={{
						fontFamily: 'Lufga',
						fontWeight: '500',
						fontSize: 50,
						textAlign: 'center',
						width: '80%',
						margin: 'auto',
						backgroundColor: "white",
						padding: '40px',
						paddingTop: '0px',
						paddingBottom: '8 0px',
						borderRadius: '20px',
					}}
				>
					<span style={{
						opacity
					}}>
						<h1>Question:</h1>
						{titleText}
						<span style={{ position: 'absolute', bottom: 20, width: '100%', left: 0, textAlign: 'center', fontSize: '15px' }}>
							Music from Tunetank.com
							omka - Vibes (Copyright Free Music)
							Download free: https://tunetank.com/track/5019-vibes</span>
					</span>
				</div>
			</Sequence>
		)
	}
	else {
		return (<></>)
	}
};
