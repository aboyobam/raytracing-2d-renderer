import type AppConfig from "@/config";

const rendererConfigs: Partial<Record<AppConfig['renderer']['renderer']['type'], AppConfig['renderer']['renderer']>> = {
    lightReflect: {
        type: "lightReflect",
        maxReflectionDepth: 3,
        lightInpercisionEpsilon: 1e-12,
        indirectIllumination: false,
        indirectIlluminationDelta: 0.2,
        indirectIlluminationDivider: 1
    },
    all: {
        type: "all",
        maxReflectionDepth: 5,
        indirectIllumination: false,
        indirectIlluminationDelta: 0.2,
        indirectIlluminationDivider: 3
    },
    stub: {
        type: "stub",
        colorMultiplier: 1
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
    file: 'glass',
    width: 500,
    height: 500,
    threads: 10,
    renderer: {
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        autoClose: true,
        renderer: rendererConfigs.all,
        optimizer: {
            maxDepth: 10
        },
        photonMapperSetup: {
            samples: 100_000,
            maxDepth: 5,
            maxSize: 2000,
            hasAlpha: true
        }
    }
}

export default config;