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
        optimizer: OtOptimizer;
        renderer:   LightRendererSetup |
                    LightAlphaRendererSetup |
                    AlphaRendererSetup |
                    WireframeRendererSetup |
                    StubRendererSetup |
                    StubReflectRendererSetup |
                    LightReflectRendererSetup |
                    AllRendererSetup;
        photonMapperSetup: {
            maxDepth: number;
            maxSize: number;
            samples: number;
            hasAlpha: boolean;
        }
    };
}

interface OtOptimizer {
    maxDepth: number;
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
    lightInpercisionEpsilon: number;
    indirectIllumination: boolean;
    indirectIlluminationDelta: number;
    indirectIlluminationDivider: number;
}

export interface AllRendererSetup {
    type: "all";
    maxReflectionDepth: number;
    indirectIllumination: boolean;
    indirectIlluminationDelta: number;
    indirectIlluminationDivider: number;
}