export default interface AppConfig {
    file: string;
    width: number;
    height: number;
    smoothing: boolean;
    threads: number;
    renderer: {
        width: number;
        height: number;
        cameraFov: number;
        cameraNear: number;
        threadSync: boolean;
        wireframe?: number;
        optimizer?: Optimizer;
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