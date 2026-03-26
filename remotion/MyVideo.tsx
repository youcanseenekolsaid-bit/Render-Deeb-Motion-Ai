import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const MyVideo: React.FC<{text: string}> = ({ text }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', fontSize: 100, color: 'black' }}>
      <div>The current frame is {frame}</div>
      <div>{text}</div>
    </AbsoluteFill>
  );
};
