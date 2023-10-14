import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera }) => {
    const mirrorGeo = new CubeGeometry(3, 3, 0.1);
    const mirrorMat = Material.WHITE.clone();
    mirrorMat.specular = 0.5;
    const mirror = new Mesh(mirrorGeo, mirrorMat);
    mirror.rotate(new Vector3(0, 1, 0), -45);
    
    const cubeGeo = new CubeGeometry(1.5, 1.5, 1.5);
    const cubeMat = Material.RED;
    const cube = new Mesh(cubeGeo, cubeMat);
    cube.position.x = 5;
    cube.rotate(new Vector3(0, 1, 0), -20);
    // cube.rotate(new Vector3(1, 0, 0), -20);

    for (let i = 0; i < 12; i += 2) {
        cube.geometry.faces[i].material = Material.GREEN;
    }

    scene.add(mirror);
    scene.add(cube);

    camera.position.set(0, 0, -15);
    camera.lookAt(Vector3.ZERO);

    const light = new Light(2, 10, 1.5);
    light.position.copy(camera.position);
    scene.addLight(light);
});