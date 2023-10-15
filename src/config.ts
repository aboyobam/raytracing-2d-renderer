import type AppConfig from "@/config";

const rendererConfigs: Partial<Record<AppConfig['renderer']['renderer']['type'], AppConfig['renderer']['renderer']>> = {
    lightReflect: {
        type: "lightReflect",
        maxReflectionDepth: 3,
        maxLightDepth: 3,
        lightInpercisionEpsilon: 1e-12,
        indirectIllumination: false,
        monteCarloSamples: 300_000,
        indirectIlluminationDelta: 0.2,
        indirectIlluminationDivider: 2
    },
    stub: {
        type: "stub",
        colorMultiplier: 2
    },
    stubReflect: {
        type: "stubReflect",
        maxDepth: 3
    },
    light: {
        type: "light",
        lightInpercisionEpsilon: 1e-12
    }
}

const config: AppConfig = {
    file: 'blender-scene',
    width: 500,
    height: 500,
    threads: 10,
    renderer: {
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        autoClose: false,
        renderer: rendererConfigs.lightReflect,
        optimizer: {
            type: "ot",
            maxDepth: 10
        }
    }
}

export default config;