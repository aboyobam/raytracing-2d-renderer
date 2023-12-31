export default interface AppConfig {
    file: string;
    threads: number;
    renderer: {
        gltf: string;
        width: number;
        height: number;
        shadeSmoothing: boolean;
        keepAspectRatio: boolean;
        autoClose: boolean;
        cameraFov: number;
        cameraNear: number;
        optimizer: OtOptimizer;
        renderer:   LightRendererSetup |
                    LightAlphaRendererSetup |
                    AlphaRendererSetup |
                    StubRendererSetup |
                    StubReflectRendererSetup |
                    LightReflectRendererSetup |
                    AllRendererSetup;
        photonMapperSetup: {
            maxDepth: number;
            maxSize: number;
            hasAlpha: boolean;
            enabled: boolean;
            gridGap: number;
            strengthDivider: number;
            delta: number;
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

export interface StubRendererSetup {
    type: "stub";
    colorMultiplier: number;
    useAngleStrength: boolean;
}

export interface StubReflectRendererSetup {
    type: "stubReflect";
    maxDepth: number;
}

export interface LightReflectRendererSetup {
    type: "lightReflect";
    maxReflectionDepth: number;
    lightInpercisionEpsilon: number;
}

export interface AllRendererSetup {
    type: "all";
    maxReflectionDepth: number;
}