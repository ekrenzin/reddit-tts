import { useCallback, useEffect, useState } from 'react';
import { interpolate, Sequence, useCurrentFrame, useVideoConfig, Audio, Video, AbsoluteFill, Loop } from 'remotion';
import { Title } from './Components/Title';
import { CommentQueue } from './Components/CommentQueue';
import json from './FetchScript/comments.json'
import video from './FetchScript/satisfying.mp4'
import lofi from './Assets/lofi.mp3'
import doorBell from './Assets/doorBell.mp3'
import { RedditComment } from './Video';
export const AskReddit: React.FC<{ comments: Array<RedditComment>, totalDuration: number }> = ({ comments, totalDuration }) => {
	const titleEnd = Math.round(json.title.titleDuration * 30) + 15
	return (
		<div style={{ flex: 1, backgroundColor: 'white' }}>
			<div >
				<Sequence from={0} durationInFrames={totalDuration}>
					{/* background noises */}
					<Audio startFrom={0} src={lofi} volume={0.1} />
					<Audio startFrom={0} src={doorBell} volume={0.7} playbackRate={2} />

					{/* background video */}
					<AbsoluteFill>
						<Loop durationInFrames={360}>
							<Video startFrom={5} src={video} volume={0.1} style={{ height: 1920, width: 1080, objectFit: 'cover' }} />
						</Loop>
					</AbsoluteFill>

					{/* main content */}
					<AbsoluteFill>
						<Title titleText={json.title.title}url={json.title.url} startFrame={0} endFrame={titleEnd} />
						<CommentQueue comments={comments} startFrom={titleEnd} />
					</AbsoluteFill>
				</Sequence>
			</div>
		</div>
	);
};
