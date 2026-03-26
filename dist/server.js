"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const renderer_1 = require("@remotion/renderer");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Setup Supabase (Not needed if we send the file directly, but kept for reference)
let supabase = null;
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
        const jobId = (0, uuid_1.v4)();
        // 2. Instead of generating a job locally, we will wait for the render
        // and then stream the file directly to the client.
        // 3. Render Video using pre-built bundle
        const serveUrl = path_1.default.resolve('./bundle');
        const comps = await (0, renderer_1.getCompositions)(serveUrl, {
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
        const tmpDir = path_1.default.resolve('./tmp');
        if (!fs_1.default.existsSync(tmpDir))
            fs_1.default.mkdirSync(tmpDir);
        const outputLocation = path_1.default.join(tmpDir, `${jobId}.mp4`);
        console.log(`Starting render for job: ${jobId}`);
        await (0, renderer_1.renderMedia)({
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
            if (fs_1.default.existsSync(outputLocation)) {
                fs_1.default.unlinkSync(outputLocation);
            }
        });
    }
    catch (error) {
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
