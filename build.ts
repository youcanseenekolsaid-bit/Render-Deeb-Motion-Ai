import { bundle } from '@remotion/bundler';
import path from 'path';

const doBuild = async () => {
  console.log('Building Remotion bundle for production...');
  try {
    const outDir = path.resolve('./bundle');
    await bundle({
      entryPoint: path.resolve('./remotion/index.ts'),
      outDir: outDir,
    });
    console.log(`Bundle built successfully to ${outDir}`);
  } catch (error) {
    console.error('Error building bundle:', error);
    process.exit(1);
  }
};

doBuild();
