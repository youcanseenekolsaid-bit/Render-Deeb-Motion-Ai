import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup Supabase (Not needed if we send the file directly, but kept for reference)
let supabase: ReturnType<typeof createClient> | null = null;

let bundledContent: string | null = null;

// Bundle Remotion project (this bundles your React code)
const getBundle = async () => {
  if (!bundledContent) {
    console.log('Building Remotion bundle...');
    bundledContent = await bundle({
      entryPoint: path.resolve('./remotion/index.ts'),
    });
    console.log('Bundle built!');
  }
  return bundledContent;
};

app.post('/api/render', async (req, res) => {
  try {
    const { code, ratio, durationInSeconds, userId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const fps = 30;
    const durationInFrames = durationInSeconds ? Math.floor(durationInSeconds * fps) : 150;
    const width = ratio === "16:9" ? 1920 : 1080;
    const height = ratio === "16:9" ? 1080 : 1920;
    const compositionId = "DynamicComp";

    // 1. Generate Job ID
    const jobId = uuidv4();
    
    // 2. Instead of generating a job locally, we will wait for the render
    // and then stream the file directly to the client.
    
    // 3. Render Video
    const serveUrl = await getBundle();
    const comps = await getCompositions(serveUrl, { inputProps: { code } });
    const composition = comps.find((c) => c.id === compositionId);

    if (!composition) {
      return res.status(404).json({ error: `Composition ${compositionId} not found` });
    }

    // Override the composition details with the ones from the frontend
    composition.durationInFrames = durationInFrames;
    composition.width = width;
    composition.height = height;

    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const outputLocation = path.join(tmpDir, `${jobId}.mp4`);
    console.log(`Starting render for job: ${jobId}`);
    
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation,
      inputProps: { code },
      // chromiumOptions: { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } // Added automatically by Docker
    });

    console.log(`Render complete for job: ${jobId}`);

    // 4. Send the file directly to the user's browser
    res.download(outputLocation, `video-${jobId}.mp4`, (err) => {
      // Clean up the local file after sending
      if (fs.existsSync(outputLocation)) {
        fs.unlinkSync(outputLocation);
      }
    });

  } catch (error: any) {
    console.error('Render error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Render failed', details: error.message });
    }
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Render server listening on port ${PORT}`);
});
