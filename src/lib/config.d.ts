export default interface AppConfig {
    file: string;
    width: number;
    height: number;
    threads: number;
    renderer: {
        width: number;
        height: number;
        autoClose: boolean;
        cameraFov: number;
        cameraNear: number;
        optimizer?: Optimizer;
        renderer:   LightRendererSetup |
                    LightAlphaRendererSetup |
                    AlphaRendererSetup |
                    WireframeRendererSetup |
                    StubRendererSetup |
                    StubReflectRendererSetup |
                    LightReflectRendererSetup;
    };
}

interface OtOptimizer {
    type: "ot";
    maxDepth: number;
}

interface QtOptimizer {
    type: "qt";
    maxSize: number;
}

export interface LightRendererSetup {
    type: "light";
    lightInpercisionEpsilon: number;
}

export interface LightAlphaRendererSetup {
    type: "lightAlpha";
    lightInpercisionEpsilon: number;
}

export interface AlphaRendererSetup {
    type: "alpha";
}

export interface WireframeRendererSetup {
    type: "wireframe";
    wireframe: number;
}

export interface StubRendererSetup {
    type: "stub";
    colorMultiplier: number;
}

export interface StubReflectRendererSetup {
    type: "stubReflect";
    maxDepth: number;
}

export interface LightReflectRendererSetup {
    type: "lightReflect";
    maxReflectionDepth: number;
    maxLightBounce: number;
    monteCarsoSamples: number;
    lightInpercisionEpsilon: number;
    minStrength: number;
}

type Optimizer = OtOptimizer | QtOptimizer;