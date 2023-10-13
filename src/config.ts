import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'porsche',
    width: 500,
    height: 500,
    threads: 1,
    renderer: {
        threadSync: false,
        //wireframe: 0.1,
        width: 100,
        height: 100,
        cameraFov: 45,
        cameraNear: 2,
        hasLight: true,
        alpha: false,
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