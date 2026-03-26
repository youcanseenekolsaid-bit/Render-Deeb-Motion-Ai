import React from 'react';
import { Composition } from 'remotion';
import { DynamicVideo } from './DynamicVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicComp"
        component={DynamicVideo}
        durationInFrames={150} // Default, overridden on renderMedia
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          code: 'export default () => <div>No Code Provided</div>'
        }}
      />
    </>
  );
};
