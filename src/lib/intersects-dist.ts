import Vector3 from "./Vector3";

export default function intersectsDist(origin: Vector3, dir: Vector3, min: Vector3, max: Vector3): number {
    let tMin = -Infinity;
    let tMax = Infinity;

    const bounds = [min.x, max.x, min.y, max.y, min.z, max.z];
    const directions = ['x', 'y', 'z'] as const;

    for (let i = 0; i < directions.length; i++) {
        const localDir = directions[i];

        if (Math.abs(dir[localDir]) < Number.EPSILON) {
            if (origin[localDir] < (bounds[i * 2]) || origin[localDir] > (bounds[i * 2 + 1])) {
                return Infinity;
            }
        } else {
            let t1 = (bounds[i * 2] - origin[localDir]) / dir[localDir];
            let t2 = (bounds[i * 2 + 1] - origin[localDir]) / dir[localDir];

            if (t1 > t2) {
                const temp = t1;
                t1 = t2;
                t2 = temp;
            };

            tMin = t1 > tMin ? t1 : tMin;
            tMax = t2 < tMax ? t2 : tMax;

            if (tMin > tMax) {
                return Infinity;
            }
        }
    }

    if (tMin < 0 && tMax < 0) {
        return Infinity;
    }

    return tMin;
}