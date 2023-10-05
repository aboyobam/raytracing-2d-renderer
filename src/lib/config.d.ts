export default interface AppConfig {
    file: string;
    width: number;
    height: number;
    smoothing: boolean;
    renderer: {
        width: number;
        height: number;
        cameraFov: number;
        cameraNear: number;
        autoUpdate: boolean;
        updateRate: number;
    };
}
