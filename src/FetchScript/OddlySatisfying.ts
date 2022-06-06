import util from 'util'
import Snoowrap from "snoowrap";
import { createWriteStream, writeFile, readFileSync } from "fs";
import { Readable } from "stream";
import dotenv from 'dotenv'
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import * as mm from 'music-metadata';
const http = require('https'); // or 'https' for https:// URLs

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

export async function loadSatisfyingVideo() {
  const AskReddit = client.getSubreddit('OddlySatisfying')
  const posts = await AskReddit.getHot({ limit: 5 })
  posts.map(handlePosts)
}

function getRandomProperty(obj: any) {
  const keys = Object.keys(obj);

  return keys[Math.floor(Math.random() * keys.length)];
}

async function handlePosts(post: { title: any; score: number; id: any; is_video: boolean; secure_media: any; media: any; }) {
  const title = post.title.split(" ").join("")
  if (post.score > 500 && post.is_video) {
    console.log(post.secure_media.reddit_video.fallback_url,)

    const file = createWriteStream(`satisfying.mp4`);
    const request = http.get(post.media.reddit_video.fallback_url, function (response: any) {
      if (!response || response.statusCode !== 200) return
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed", file);
      });
    });
  }
}

