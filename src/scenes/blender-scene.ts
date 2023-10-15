import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import CubeGeometry from "@/geometries/CubeGeometry";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const offset = 1;
    const geo = await OBJParser.parse("scene.obj");
    
    const mesh = new Mesh(geo, new Material(250, 0, 0));
    // mesh.material.alpha = 0.5;
    // mesh.position.set(0, -2, 6);

    const lightTop = new Light(1.5, 20, 1.5);
    lightTop.position.copy(mesh.position.add(new Vector3(0, 10, 0)));
    scene.addLight(lightTop);

    const leftLight = new Light(0.5, 10, 1.1);
    leftLight.position.copy(mesh.position.add(new Vector3(-5, 0, 0)));
    // scene.addLight(leftLight);

    camera.position.set(0, 12, -5);
    camera.lookAt(mesh.position);

    const camLight = new Light(1.7, 20, 1.3);
    camLight.position.copy(camera.position);
    scene.addLight(camLight);

    const planeGeo = PlaneGeometry.asFloor(mesh, offset);
    const floorMat = Material.BLUE.clone();
    // floorMat.specular = 0.3;
    const plane = new Mesh(planeGeo, floorMat);
    scene.add(plane);
    scene.add(mesh);

    // mirror
    const [min, max] = geo.getBoundingBox();
    const mirrorGeo = new CubeGeometry(max.x - min.x, max.y - min.y + 6 * offset, 0.1);
    const mirrorMat = Material.WHITE.clone();
    mirrorMat.specular = 0.8;
    mirrorMat.illusive = 0.8;

    const mirror = new Mesh(mirrorGeo, mirrorMat);
    mirror.rotate(new Vector3(1, 0, 0), 10);
    mirror.rotate(new Vector3(0, 1, 0), -20);
    mirror.position.set(Vector3.midpoint(min, max).x, Vector3.midpoint(min, max).y + 3 * offset, max.z + offset + 0.5);
    scene.add(mirror);
});