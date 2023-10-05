import AppConfig from "@/config";

const config: AppConfig = {
    file: 'example1',
    width: 500,
    height: 500,
    smoothing: false,
    renderer: {
        width: 1000,
        height: 1000,
        cameraFov: 45,
        cameraNear: 2,
        autoUpdate: true,
        updateRate: 250
    }
}

export default config;