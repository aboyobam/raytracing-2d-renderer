import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'porsche',
    width: 500,
    height: 500,
    smoothing: true,
    threads: 8,
    renderer: {
        threadSync: true,
        wireframe: 0,
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        qtEnabled: true,
        qtMaxSize: 256,
    }
}

export default config;