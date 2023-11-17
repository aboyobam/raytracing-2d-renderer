declare class Light {
    color: [number, number, number];
    intensity: number;
    distance: number;
    decay: number;

    constructor(intensity: number, distance: number, decay: number);
}