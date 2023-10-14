import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'reflect',
    width: 500,
    height: 500,
    threads: 10,
    renderer: {
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        renderer: {
            type: "lightReflect",
            maxReflectionDepth: 3,
            maxLightBounce: 1,
            lightInpercisionEpsilon: 1e-12,
            minStrength: 1e-3
        },
        /*renderer: {
            type: "stub",
            colorMultiplier: 2
        },*/
        /*renderer: {
            type: "stubReflect",
            maxDepth: 3
        },*/
        optimizer: {
            type: "ot",
            maxDepth: 10
        }
        /*optimizer: {
            type: "qt",
            maxSize: 256
        }*/
    }
}

export default config;