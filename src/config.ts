import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'blender-scene',
    width: 500,
    height: 500,
    smoothing: true,
    threads: 10,
    renderer: {
        threadSync: false,
        //wireframe: 0.1,
        width: 500,
        height: 500,
        cameraFov: 45,
        cameraNear: 2,
        optimizer: {
            type: "ot",
            maxDepth: 10
        }
        /*optimizer: {
            type: "qt",
            maxSize: 128
        }*/
    }
}

export default config;