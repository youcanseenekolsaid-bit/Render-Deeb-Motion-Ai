"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemotionRoot = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const DynamicVideo_1 = require("./DynamicVideo");
const RemotionRoot = () => {
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(remotion_1.Composition, { id: "DynamicComp", component: DynamicVideo_1.DynamicVideo, durationInFrames: 150, fps: 30, width: 1080, height: 1920, defaultProps: {
                code: 'export default () => <div>No Code Provided</div>'
            } }) }));
};
exports.RemotionRoot = RemotionRoot;
