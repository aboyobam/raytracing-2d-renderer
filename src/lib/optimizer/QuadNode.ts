import Face from "@/Face";
import Vector3 from "@/Vector3";
import QuadTree, { MeshAndFace } from "./QuadTree";
import Mesh from "@/Mesh";

export default class QuadNode {

    public readonly entries: MeshAndFace[] = [];
    private readonly children: QuadNode[] = [];

    constructor(public readonly tree: QuadTree, public readonly corners: [Vector3, Vector3, Vector3, Vector3]) {}

    get topRight() { return this.corners[0] };
    get bottomRight() { return this.corners[1] };
    get bottomLeft() { return this.corners[2] };
    get topLeft() { return this.corners[3] };

    private overlaps(vertex: Vector3) {
        const normal = this.bottomLeft.sub(this.topLeft).cross(this.topRight.sub(this.topLeft)).norm();
    
        const d = this.topLeft.dot(normal);
        const t = (d - this.tree.camera.position.dot(normal)) / vertex.dot(normal);
        const intersection = this.tree.camera.position.add(vertex.multScalar(t));

        const withinX = Math.min(this.topLeft.x, this.bottomRight.x) <= intersection.x && intersection.x <= Math.max(this.topLeft.x, this.bottomRight.x);
        const withinY = Math.min(this.topLeft.y, this.bottomRight.y) <= intersection.y && intersection.y <= Math.max(this.topLeft.y, this.bottomRight.y);
        const withinZ = Math.min(this.topLeft.z, this.bottomRight.z) <= intersection.z && intersection.z <= Math.max(this.topLeft.z, this.bottomRight.z);
    
        return withinX && withinY && withinZ;
    }

    private overlapsFace(face: Face) {
        const normal = this.bottomLeft.sub(this.topLeft).cross(this.topRight.sub(this.topLeft)).norm();
    
        const [min, max] = face.getBoundingBox();
        const vertex = Vector3.midpoint(min, max);

        const d = this.topLeft.dot(normal);
        const t = (d - this.tree.camera.position.dot(normal)) / vertex.dot(normal);
        const intersection = this.tree.camera.position.add(vertex.multScalar(t));

        const [m, x] = face.clone().translate(intersection.sub(vertex)).getBoundingBox();

        const withinX = Math.min(this.topLeft.x, this.bottomRight.x) <= x.x && m.x <= Math.max(this.topLeft.x, this.bottomRight.x);
        const withinY = Math.min(this.topLeft.y, this.bottomRight.y) <= x.y && m.y <= Math.max(this.topLeft.y, this.bottomRight.y);
        const withinZ = Math.min(this.topLeft.z, this.bottomRight.z) <= x.z && m.z <= Math.max(this.topLeft.z, this.bottomRight.z);
    
        return withinX && withinY && withinZ;
    }

    insert(mesh: Mesh, face: Face) {
        if (this.children.length) {
            for (const child of this.children) {
                child.insert(mesh, face);
            }

            return;
        }

        if (this.overlapsFace(face)) {
            const size = this.entries.push([mesh, face]);

            if (size >= QuadTree.MAX_COUNT) {
                this.subdivide();
            }

            return;
        }
    }

    private subdivide() {
        const [topRight, bottomRight, bottomLeft, topLeft] = this.corners;
        const topMid = Vector3.midpoint(topRight, topLeft);
        const rightMid = Vector3.midpoint(topRight, bottomRight);
        const bottomMid = Vector3.midpoint(bottomRight, bottomLeft);
        const leftMid = Vector3.midpoint(topLeft, bottomLeft);
    
        const center = Vector3.midpoint(Vector3.midpoint(topMid, bottomMid), Vector3.midpoint(rightMid, leftMid));
    
        this.children.push(
            new QuadNode(this.tree, [topRight, rightMid, center, topMid]),
            new QuadNode(this.tree, [rightMid, bottomRight, bottomMid, center]),
            new QuadNode(this.tree, [center, bottomMid, bottomLeft, leftMid]),
            new QuadNode(this.tree, [topMid, center, leftMid, topLeft])
        );
    }

    *intersects(dir: Vector3, seen: Set<Face>): IterableIterator<MeshAndFace> {
        if (!this.overlaps(dir)) {
            return;
        }

        yield* this.entries;

        for (const child of this.children) {
            yield* child.intersects(dir, seen);
        }
    }

    print(indent = 0) {
        const sep = "  ";
        const parts: string[] = [];
        
        parts.push("Conners:");
        parts.push(sep + `topLeft: (${this.topLeft.x.toFixed(3)}, ${this.topLeft.y.toFixed(3)}, ${this.topLeft.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.topRight.x.toFixed(3)}, ${this.topRight.y.toFixed(3)}, ${this.topRight.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.bottomLeft.x.toFixed(3)}, ${this.bottomLeft.y.toFixed(3)}, ${this.bottomLeft.z.toFixed(3)})`);
        parts.push(sep + `topLeft: (${this.bottomRight.x.toFixed(3)}, ${this.bottomRight.y.toFixed(3)}, ${this.bottomRight.z.toFixed(3)})`);

        if (this.entries.length) {
            parts.push("Entries:");
            for (const entry of this.entries) {
                parts.push(sep + entry[1].name);
            }
        }
        
        if (this.children.length && this.children.some(child => child.entries.length)) {
            parts.push("Children:");
            for (const child of this.children) {
                parts.push(child.print(indent + 1));
            }
        }

        return parts.map(p => sep.repeat(indent) + p).join("\n");
    }
}