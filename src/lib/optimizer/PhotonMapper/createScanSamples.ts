import Face from "@/Face";
import Vector3 from "@/Vector3";

export default function* createScanSamples(face: Face, delta: number): Iterable<Vector3> {
    for (let alpha = 0; alpha <= 1; alpha += delta) {
        for (let beta = 0; beta <= 1 - alpha; beta += delta) {
            const gamma = 1 - alpha - beta;
            yield face.u.multScalar(alpha).add(face.v.multScalar(beta)).add(face.w.multScalar(gamma));
        }
    }
}