"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bundler_1 = require("@remotion/bundler");
const path_1 = __importDefault(require("path"));
const doBuild = async () => {
    console.log('Building Remotion bundle for production...');
    try {
        const outDir = path_1.default.resolve('./bundle');
        await (0, bundler_1.bundle)({
            entryPoint: path_1.default.resolve('./remotion/index.ts'),
            outDir: outDir,
        });
        console.log(`Bundle built successfully to ${outDir}`);
    }
    catch (error) {
        console.error('Error building bundle:', error);
        process.exit(1);
    }
};
doBuild();
