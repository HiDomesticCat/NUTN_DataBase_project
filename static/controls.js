import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

export function addControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;  // 禁用旋轉
    controls.enableZoom = true;
    controls.minZoom = 0.5;
    controls.maxZoom = 2;
    controls.screenSpacePanning = true;  // 啟用 2D 平移

    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN };  // 僅允許平移操作
    return controls;
}

export function handleFloorSwitching(scene, floors) {
    let currentFloor = 0;
    floors.forEach((floor, index) => {
        floor.visible = (index === currentFloor);
    });

    document.getElementById("nextFloor").addEventListener("click", () => {
        currentFloor = (currentFloor + 1) % floors.length;
        floors.forEach((floor, index) => {
            floor.visible = (index === currentFloor);
        });
    });

    document.getElementById("prevFloor").addEventListener("click", () => {
        currentFloor = (currentFloor - 1 + floors.length) % floors.length;
        floors.forEach((floor, index) => {
            floor.visible = (index === currentFloor);
        });
    });
}

