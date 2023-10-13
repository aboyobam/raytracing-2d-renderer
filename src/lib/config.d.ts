export default interface AppConfig {
    file: string;
    width: number;
    height: number;
    threads: number;
    renderer: {
        width: number;
        hasLight: boolean;
        height: number;
        cameraFov: number;
        cameraNear: number;
        threadSync: boolean;
        wireframe?: number;
        optimizer?: Optimizer;
        alpha: boolean;
    };
}

interface OtOptimizer {
    type: "ot";
    maxDepth: number;
}

interface QtOptimizer {
    type: "qt";
    maxSize: number;
}

type Optimizer = OtOptimizer | QtOptimizer;