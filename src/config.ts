import type AppConfig from "@/config";

const config: AppConfig = {
    file: 'porsche',
    width: 500,
    height: 500,
    threads: 10,
    renderer: {
        threadSync: false,
        //wireframe: 0.1,
        width: 500,
        height: 500,
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