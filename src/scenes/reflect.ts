import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import setup from "@/setup";

setup(({ scene, camera, renderer }) => {
    const mirrorGeo = new CubeGeometry(3, 3, 0.1);
    const mirrorMat = Material.WHITE;
    const mirror = new Mesh(mirrorGeo, mirrorMat);
    mirror.rotate(new Vector3(0, 1, 0).norm(), -45);
    // mirror.rotate(new Vector3(1, 0, 0).norm(), -45);
    const illusiv = mirrorMat.clone();
    illusiv.illusive = 1;
    illusiv.specular = 0.5;

    mirrorGeo.faces.filter(face => face.name.includes("front")).forEach(face => face.material = illusiv);
    const cubeGeo = new CubeGeometry(1.5, 1.5, 1.5);
    const cubeMat = Material.RED;
    const cube = new Mesh(cubeGeo, cubeMat);
    cube.position.x = 5;
    cube.rotate(new Vector3(0, 1, 0), -20);

    for (let i = 0; i < 12; i += 2) {
        cube.geometry.faces[i].material = Material.GREEN;
    }

    scene.add(mirror);
    scene.add(cube);

    camera.position.set(0, 10, -15);
    camera.lookAt(Vector3.ZERO);

    const light = new Light(2, 10, 1.5);
    light.position.copy(camera.position);
    scene.addLight(light);

    // DUMMY
    /*setTimeout(() => {
        const myRenderer = renderer as TLightReflectRenderer;
        const target = new Vector3(4, 0, 15);
        console.log(myRenderer.calcLight(target));
    }, 100);*/
    
    /*if (renderer instanceof LightReflectRenderer) {
        // const center = 
    }*/
});