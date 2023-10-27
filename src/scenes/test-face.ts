import Face from "@/Face";
import Geometry from "@/Geometry";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import createScanSamples from "@/optimizer/PhotonMapper/createScanSamples";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const axis = new Vector3(0.1, 0.2, 0.3).norm();
    const angle = 12;

    const point1 = new Vector3(0, 0, 0);
    const point2 = new Vector3(1, 0, 0);
    const point3 = new Vector3(0, 1, 0);
    const face = new Face(point1, point2, point3, new Vector3(0, 0, -1), Material.GREEN);
    const geo = new Geometry([face]);
    const mesh = new Mesh(geo);
    mesh.rotate(axis, angle);
    camera.position.set(0.5, 0.5, -5);
    camera.near = 0.1;

    scene.add(mesh);

    for (const point of createScanSamples(mesh.geometry.faces[0], camera.position, 0.02)) {
        const cubeGeo = new CubeGeometry(0.01, 0.01, 0.01);
        const cubeMesh = new Mesh(cubeGeo, Material.RED);
        cubeMesh.position.copy(point);
        scene.add(cubeMesh);        
    }
});