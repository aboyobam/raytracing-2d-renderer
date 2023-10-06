import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'example3',
    width: 500,
    height: 500,
    smoothing: false,
    threads: 12,
    renderer: {
        wireframe: 0,
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        qtEnabled: true,
        qtMaxSize: 24
    }
}

export default config;