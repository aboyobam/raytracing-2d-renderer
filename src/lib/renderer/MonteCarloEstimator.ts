import Vector3 from "@/Vector3";

export default class MonteCarloEstimator {
    readonly vertecies: Vector3[];

    constructor(samples: number) {
        const vertecies: Vector3[] = [];
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < samples; i++) {
            const y = 1 - (i / (samples - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);

            const theta = phi * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            const vertex = new Vector3(x, y, z);
            vertecies.push(vertex);
        }
        
        this.vertecies = vertecies;
    }

    *[Symbol.iterator]() {
        yield* this.vertecies;
    }
}