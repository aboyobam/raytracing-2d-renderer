import Face from "@/Face";
import Geometry from "@/Geometry";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const vertecies = [
        new Vector3(-1, -1, -1),
        new Vector3(1, 1, -1),
        new Vector3(-1, 1, 1),
        new Vector3(1, -1, 1)
    ];

    const faces = [
        new Face(vertecies[0], vertecies[1], vertecies[2], new Vector3(0, 0, -1)),
        new Face(vertecies[3], vertecies[1], vertecies[2], new Vector3(0, 0, -1)),
        new Face(vertecies[0], vertecies[3], vertecies[2], new Vector3(0, 0, -1)),
        new Face(vertecies[0], vertecies[1], vertecies[3], new Vector3(0, 0, -1)),
    ];

    const geo = new Geometry(faces);
    const mesh = new Mesh(geo, Material.RED);
    mesh.rotate(new Vector3(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1), 50);
    mesh.position.z = 10;
    scene.add(mesh);
});