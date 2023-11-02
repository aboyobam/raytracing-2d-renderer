import type AppConfig from "@/config";

// const params = new URL(location.href).searchParams;

const rendererConfigs: Partial<Record<AppConfig['renderer']['renderer']['type'], AppConfig['renderer']['renderer']>> = {
    lightReflect: {
        type: "lightReflect",
        maxReflectionDepth: 3,
        lightInpercisionEpsilon: 1e-12,
    },
    all: {
        type: "all",
        maxReflectionDepth: 3
    },
    stub: {
        type: "stub",
        colorMultiplier: 1,
        useAngleStrength: true
    },
    stubReflect: {
        type: "stubReflect",
        maxDepth: 10
    },
    light: {
        type: "light",
        lightInpercisionEpsilon: 1e-12
    }
}

/*
const config: AppConfig = {
    file: params.get('file') || 'glass',
    width: 500,
    height: 500,
    threads: parseInt(params.get('threads') || '10'),
    renderer: {
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        autoClose: false,
        renderer: rendererConfigs[(params.get('renderer') as keyof typeof rendererConfigs) || 'light'],
        optimizer: {
            maxDepth: 25
        },
        photonMapperSetup: {
            samples: 200_000,
            maxDepth: 5,
            maxSize: 2000,
            hasAlpha: false,
            enabled: false
        }
    }
}

export default config;*/

export default rendererConfigs;