import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'blender-scene',
    width: 500,
    height: 500,
    smoothing: true,
    threads: 10,
    renderer: {
        threadSync: true,
        wireframe: 0,
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        qtEnabled: true,
        qtMaxSize: 512,
    }
}

export default config;