"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyVideo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const MyVideo = ({ text }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', fontSize: 100, color: 'black' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["The current frame is ", frame] }), (0, jsx_runtime_1.jsx)("div", { children: text })] }));
};
exports.MyVideo = MyVideo;
