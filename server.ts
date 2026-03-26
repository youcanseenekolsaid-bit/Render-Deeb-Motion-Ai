import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Bundling is now handled strictly in the Docker build phase!
// so we don't crash the 512MB RAM live server.

app.post('/api/render', async (req, res) => {
  try {
    const { code, ratio, durationInSeconds, userId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const fps = 24; // 24 FPS saves 20% rendering time compared to 30 FPS
    const durationInFrames = durationInSeconds ? Math.floor(durationInSeconds * fps) : 120;
    // Compress resolution to 720p to guarantee it finishes within 100 seconds timeout limit
    const width = ratio === "16:9" ? 1280 : 720;
    const height = ratio === "16:9" ? 720 : 1280;
    const compositionId = "DynamicComp";

    // 1. Generate Job ID
    const jobId = uuidv4();
    
    // 2. Instead of generating a job locally, we will wait for the render
    // and then stream the file directly to the client.
    
    // 3. Render Video using pre-built bundle
    const serveUrl = path.resolve('./bundle');
    const comps = await getCompositions(serveUrl, { 
      inputProps: { code },
      browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH
    });
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
      concurrency: 1, // Only render one frame at a time to prevent Out Of Memory on Render.com free plan
      inputProps: { code },
      browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH,
      imageFormat: 'jpeg', // JPEG is far less memory intensive than PNG
      jpegQuality: 80
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
