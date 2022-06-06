import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import md5 from 'md5';
import {
	SpeechConfig,
	SpeechSynthesisResult,
	SpeechSynthesizer,
} from 'microsoft-cognitiveservices-speech-sdk';

export const voices = {
	enUSMan1: 'en-US-EricNeural',
	enUSMan2: 'en-US-GuyNeural',
	enUSWoman1: 'en-US-JennyNeural',
	enUSWoman2: 'en-US-AriaNeural',
} as const;

export const textToSpeech = async (
	text: string,
	voice: keyof typeof voices,
	source: string
): Promise<{ key: string, url: string, fileName: string }> => {
	const speechConfig = SpeechConfig.fromSubscription(
		process.env.AZURE_TTS_KEY || '',
		process.env.AZURE_TTS_REGION || ''
	);

	if (!voices[voice]) {
		throw new Error('Voice not found');
	}

	const fileName = `${md5(text)}.wav`;

	const fileExists = await checkIfAudioHasAlreadyBeenSynthesized(fileName, source);
	if (fileExists) {
		return createS3Url(fileName, source);
	}

	const synthesizer = new SpeechSynthesizer(speechConfig);

	const ssml = `
                <speak version="1.0" xml:lang="en-US">
                    <voice name="${voices[voice]}">
                        <break time="100ms" /> ${text}
                    </voice>
                </speak>`;

	const result = await new Promise<SpeechSynthesisResult>(
		(resolve, reject) => {
			synthesizer.speakSsmlAsync(
				ssml,
				(res) => {
					resolve(res);
				},
				(error) => {
					reject(error);
					synthesizer.close();
				}
			);
		}
	);
	const { audioData } = result;

	synthesizer.close();

	await uploadTtsToS3(audioData, fileName, source);
	return createS3Url(fileName, source);
};

const checkIfAudioHasAlreadyBeenSynthesized = async (fileName: string, source: string) => {
	const bucketName = process.env.AWS_S3_BUCKET_NAME;
	const awsRegion = process.env.AWS_S3_REGION;
	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
		},
	});

	try {
		return await s3.send(
			new GetObjectCommand({ Bucket: bucketName, Key: "audio/" + source + '/' + fileName })
		);
	} catch {
		return false;
	}
};

const uploadTtsToS3 = async (audioData: ArrayBuffer, fileName: string, source: string) => {
	const bucketName = process.env.AWS_S3_BUCKET_NAME;
	const awsRegion = process.env.AWS_S3_REGION;
	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
		},
	});


	return s3.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: "audio/" + source + '/' + fileName,
			Body: new Uint8Array(audioData),
		})
	);
};

const createS3Url = (fileName: string, source: string) => {
	const bucketName = process.env.AWS_S3_BUCKET_NAME;
	const key = `audio/${source}/${fileName}`
	return { key, url: `https://${bucketName}.s3.amazonaws.com/${key}`, fileName: fileName }
};
