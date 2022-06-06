import { useCallback, useEffect, useState } from 'react';
import {
	Audio,
	continueRender,
	delayRender,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import '../css/fonts.css'

export const Comment: React.FC<{
	message: string;
	author: string;
	url: string;
	startFrame: number;
	endFrame : number
	upvotes: number;
}> = ({ message, upvotes, author, url, startFrame, endFrame }) => {
  const frame = useCurrentFrame();

	const [handle] = useState(() => delayRender());
	const [audioUrl, setAudioUrl] = useState('');
	const fetchTts = useCallback(async () => {
		setAudioUrl(url);
		continueRender(handle);
	}, [handle, message]);

	useEffect(() => {
		fetchTts();
	}, [fetchTts]);

	if (frame > startFrame && frame < endFrame) return (<Sequence from={startFrame}  >
		{audioUrl ? <Audio startFrom={0} src={audioUrl} volume={1} /> : <></>}
		<div
			style={{
				fontFamily: 'Lufga',
				fontWeight: '500',
				fontSize: 30,
				textAlign: 'center',
				width: '80%',
				margin: 'auto',
				overflowWrap: 'anywhere',
				hyphens: 'auto',
				padding: '30px',
				borderRadius: '20px',
				background: 'rgba(255, 255, 255, 0.7)'
			}}
		>
			<h1>{author} responds:</h1>
			<h3 style={{color: "#3730a3"}}>upvoted {upvotes} times</h3>
			<span >
				{message}
			</span>
		</div>
	</Sequence>) 
	else return <></>
};
