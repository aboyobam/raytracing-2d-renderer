import Face from "@/Face";
import Geometry from "@/Geometry";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";

export default class PlaneGeometry extends Geometry {
    static asFloor(mesh: Mesh, offset = 0): PlaneGeometry {
        const [min, max] = mesh.geometry.getBoundingBox();
        const planeGeo = new PlaneGeometry(
            new Vector3(min.x - offset, min.y, min.z - offset).add(mesh.worldPosition),
            new Vector3(max.x + offset, min.y, max.z + offset).add(mesh.worldPosition),
            new Vector3(0, 1, 0)
        );

        return planeGeo;
    }

    constructor(topLeft: Vector3, bottomRight: Vector3, normal: Vector3) {
        const topRight = new Vector3(bottomRight.x, topLeft.y, topLeft.z);
        const bottomLeft = new Vector3(topLeft.x, bottomRight.y, bottomRight.z);

        super([
            new Face(topLeft, topRight, bottomRight, normal, null, "Plane_top"),
            new Face(topLeft, bottomLeft, bottomRight, normal, null, "Plane_bottom")
        ]);
    }
}