import { useState } from 'react';
import { Composition } from 'remotion';
import { AskReddit } from './AskReddit';
import json from './FetchScript/comments.json'
export interface RedditComment {
	message: string;
	name: string;
	upvotes: number;
	downvotes: number;
	url: string;
	duration: number;
}
export const RemotionVideo: React.FC = () => {
	const [ignoredComments, setIgnoredComments] = useState<Array<RedditComment>>([])
	if (!process.env.AZURE_TTS_KEY) {
		throw new Error(
			'AZURE_TTS_KEY environment variable is missing. Read the docs first and complete the setup.'
		);
	}
	if (!process.env.AZURE_TTS_REGION) {
		throw new Error(
			'AZURE_TTS_REGION environment variable is missing. Read the docs first and complete the setup.'
		);
	}
	if (!process.env.AWS_S3_BUCKET_NAME) {
		throw new Error(
			'AWS_S3_BUCKET_NAME environment variable is missing. Read the docs first and complete the setup.'
		);
	}
	if (!process.env.AWS_S3_REGION) {
		throw new Error(
			'AWS_S3_REGION environment variable is missing. Read the docs first and complete the setup.'
		);
	}
	if (!process.env.AWS_ACCESS_KEY_ID) {
		throw new Error(
			'AWS_ACCESS_KEY_ID environment variable is missing. Read the docs first and complete the setup.'
		);
	}
	if (!process.env.AWS_SECRET_ACCESS_KEY) {
		throw new Error(
			'AWS_SECRET_ACCESS_KEY environment variable is missing. Read the docs first and complete the setup.'
		);
	}

	const fps = 30
	const titleDur = json.title.titleDuration * fps
	let totalDur = titleDur

	const comments: Array<RedditComment> = json.comments.filter(v => {
		return !ignoredComments.includes(v)
	})


	for (const comment of comments) {
		totalDur = totalDur + comment.duration * fps
	}
	const roundedDur = Math.round(totalDur + 30)
	if ((roundedDur / fps) > 60) {
		const over = roundedDur / fps - 60

		let leastDiff = comments[0]
		for (const comment of comments) {
			const diff = over - comment.duration
			if (diff < 0) {
				if (diff <  over - leastDiff.duration) leastDiff = comment
			}
			setIgnoredComments([...ignoredComments, leastDiff])
		}
	}

	console.log({comments})
	return (
		<>
			<Composition
				id="AskReddit"
				component={AskReddit}
				durationInFrames={roundedDur}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					comments: comments,
					totalDuration: roundedDur
				}}
			/>
		</>
	);
};
