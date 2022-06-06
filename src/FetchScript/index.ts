import util from 'util'
import Snoowrap from "snoowrap";
import { createWriteStream, writeFile, readFileSync } from "fs";
import { Readable } from "stream";
import dotenv from 'dotenv'
import { textToSpeech } from './TextToSpeech'
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import * as mm from 'music-metadata';
import { loadSatisfyingVideo } from './OddlySatisfying';

const mp3Duration = require('mp3-duration');

dotenv.config()
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const awsRegion = process.env.AWS_S3_REGION;

const client = new Snoowrap({
  userAgent: 'reddit-tts',
  clientId: process.env.REDDIT_ID,
  clientSecret: process.env.REDDIT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
});

const s3 = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function loadData() {
  await loadSatisfyingVideo();
  const AskReddit = client.getSubreddit('AskReddit')
  const posts = await AskReddit.getHot({ limit: 1 })
  posts.map(handlePosts)
}

const voices = {
	enUSMan1: 'en-US-EricNeural',
	enUSMan2: 'en-US-GuyNeural',
	enUSWoman1: 'en-US-JennyNeural',
	enUSWoman2: 'en-US-AriaNeural',
}
function getRandomProperty(obj: any) {
  const keys = Object.keys(obj);

  return keys[Math.floor(Math.random() * keys.length)];
}

async function handlePosts(post: { title: any; score: number; id: any; }) {
  const title = post.title
  if (post.score > 500) {
    const res = await client.getSubmission(post.id).expandReplies({ limit: 1, depth: 1 }).then(async (res: { comments: any; }) => {
      const comments = res.comments
      const sortedComments = comments.sort((a: { ups: number; }, b: { ups: number; }) => {
        if (a.ups > b.ups) return -1
        else return 1
      })
      const shortenedComments = sortedComments.slice(0,5)
      const mappedComments = shortenedComments.map((c: { author: { name: string; }; body: string; ups: number; downs: string; }) => {
        return {
          name: c.author.name,
          message: c.body,
          upvotes: c.ups,
          downvotes: c.downs,
        }
      })
      const titleVoice = getRandomProperty(voices)
      const joinedTitle = title.replace(/[^a-zA-Z ]/g, "").split(" ").join("-")
      const titleAudio = await textToSpeech(title, 'enUSWoman1', joinedTitle);
      const titleFile = await retrieveAudioFile(titleAudio.key)
      const titleDuration = await getDuration(titleFile, titleAudio.fileName)

      let commentPromises: Array<any> = []
      for (const comment of mappedComments) {
        let commentPromise = new Promise(async (resolve, reject) => {
          const audio = await textToSpeech(comment.message, 'enUSMan1', joinedTitle);
          const file = await retrieveAudioFile(audio.key)
          const duration = await getDuration(file, audio.fileName)
          comment.url = audio.url
          comment.duration = duration
          resolve(comment);
        })
        commentPromises = [...commentPromises, commentPromise]
      }

      Promise.all(commentPromises).then(() => {
        console.log("WRITE JSON")
        const json = JSON.stringify({ title: { url: titleAudio.url, title, titleDuration }, comments: mappedComments })
        writeFile('comments.json', json, function (err) {
          if (err) console.log(err);
        });
      })
    })
  }
}

const retrieveAudioFile = async (key: string) => {
  return await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: key }))
}

const getDuration = async (awsFile: GetObjectCommandOutput, name: string) => {
  return new Promise((resolve, reject) => {
    try {
      const localFile = createWriteStream(`./tmp/${name}`)
      const file_stream = awsFile.Body!;
      if (file_stream instanceof Readable) {
        file_stream.pipe(localFile)
      } else {
        throw new Error('Unknown object stream type.');
      }
      localFile.on('finish', async () => {
        const metadata = await mm.parseFile(`./tmp/${name}`, {duration: true});
        resolve(metadata.format.duration)
      })
    } catch (e) {
      console.log(e)
      reject("ERROR")
    }
  })
}

loadData()