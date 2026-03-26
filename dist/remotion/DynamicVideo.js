"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicVideo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const sucrase_1 = require("sucrase");
const Remotion = __importStar(require("remotion"));
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsx)("div", { style: { color: "red", padding: 20, backgroundColor: "black", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "24px" }, children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: "10px" }, children: "Runtime Error" }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: "16px", opacity: 0.8 }, children: this.state.error?.message })] }) }));
        }
        return this.props.children;
    }
}
const DynamicVideo = ({ code }) => {
    const Component = (0, react_1.useMemo)(() => {
        if (!code)
            return null;
        try {
            const compiled = (0, sucrase_1.transform)(code, {
                transforms: ["typescript", "jsx", "imports"],
                jsxRuntime: "classic",
            }).code;
            const exports = {};
            const require = (moduleName) => {
                if (moduleName === "react")
                    return react_1.default;
                if (moduleName === "remotion")
                    return Remotion;
                throw new Error(`Module ${moduleName} not found`);
            };
            const executeCode = new Function("exports", "require", "React", compiled);
            executeCode(exports, require, react_1.default);
            const Component = exports.default || (() => (0, jsx_runtime_1.jsx)("div", { style: { color: "white" }, children: "No default export found" }));
            Component.displayName = "GeneratedVideo";
            const SafeComponent = (props) => ((0, jsx_runtime_1.jsx)(ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(Component, { ...props }) }));
            SafeComponent.displayName = "SafeGeneratedVideo";
            return SafeComponent;
        }
        catch (err) {
            console.error("Compilation error:", err);
            const ErrorComponent = () => ((0, jsx_runtime_1.jsxs)("div", { style: { color: "red", padding: 20, backgroundColor: "black", width: "100%", height: "100%" }, children: ["Error compiling video code: ", err.message] }));
            ErrorComponent.displayName = "ErrorComponent";
            return ErrorComponent;
        }
    }, [code]);
    if (!Component)
        return null;
    return (0, jsx_runtime_1.jsx)(Component, {});
};
exports.DynamicVideo = DynamicVideo;
