import Vector3 from "@/Vector3";

export default function* magicSpiral(n: number, offset = 0, skip = 1): Iterable<Vector3> {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = offset; i < n; i += skip) {
        const y = 1 - (i / (n - 1)) * 2; // y goes from 1 to -1
        const radius = Math.sqrt(1 - y * y); // radius at y
        const theta = goldenAngle * i; // golden angle increment
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        yield new Vector3(x, y, z);
    }
}