import Vector3 from "@/Vector3";
import Photon from "./Photon";
import PhotonTree from "./PhotonTree";

export default class PhotonNode {
    constructor(private readonly tree: PhotonTree, private readonly position: Vector3, private readonly size: number) {};

    private readonly entries: Photon[] = [];
    private children: PhotonNode[] = [];

    add(photon: Photon): boolean {
        if (this.isInside(photon.position)) {
            if (this.children.length) {
                for (const child of this.children) {
                    if (child.add(photon)) {
                        return true;
                    }
                }
            } else {
                const total = this.entries.push(photon);
                if (total >= this.tree.maxSize) {
                    this.subdivide();
                    const ogEntries: Photon[] = this.entries.splice(0, this.entries.length);
                    
                    for (const entry of ogEntries) {
                        this.add(entry);
                    }

                    return this.add(photon);
                }

                return true;
            }
        }

        return false;
    }

    isInside(v: Vector3, delta = 0) {
        const [px, py, pz] = v;
        const [ox, oy, oz] = this.position;
        const s = this.size;
        return !(
            px < (ox - s - delta) || px > (ox + s + delta) ||
            py < (oy - s - delta) || py > (oy + s + delta) ||
            pz < (oz - s - delta) || pz > (oz + s + delta)
        );
    }

    *get(point: Vector3, delta: number): Iterable<Photon> {
        if (!this.isInside(point, delta)) {
            return;
        }

        const deltaSq = delta ** 2;
        for (const entry of this.entries) {
            if (entry.position.sub(point).lenSq() < deltaSq) {
                yield entry;
            }
        }

        for (const child of this.children) {
            yield* child.get(point, delta);
        }
    }

    private subdivide() {
        for (const x of [0, 1]) {
            for (const y of [0, 1]) {
                for (const z of [0, 1]) {
                    const newPos = this.position.clone().add(new Vector3((x - 0.5) * this.size, (y - 0.5) * this.size, (z - 0.5) * this.size));
                    this.children.push(new PhotonNode(this.tree, newPos, this.size / 2));
                }
            }
        }
    }
}