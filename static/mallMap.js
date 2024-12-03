import * as THREE from './lib/three.module.js';

export function createMallMap(scene) {
    const floorGroup1 = new THREE.Group();
    const floorGroup2 = new THREE.Group();
    const floorGeometry = new THREE.PlaneGeometry(0, 0);

    // Create Floor 1
    const floor1Material = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const floor1Mesh = new THREE.Mesh(floorGeometry, floor1Material);
    floorGroup1.add(floor1Mesh);

    const storeGeometry = new THREE.BoxGeometry(50, 20, 50);
    const storeMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });

    const store1 = new THREE.Mesh(storeGeometry, storeMaterial);
    store1.position.set(100, 0, 100);  // Position on floor 1 (2D)
    floorGroup1.add(store1);

    // Create Floor 2
    const floor2Material = new THREE.MeshBasicMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide });
    const floor2Mesh = new THREE.Mesh(floorGeometry, floor2Material);
    floorGroup2.add(floor2Mesh);

    const storeMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00FFF0 });

    const store2 = new THREE.Mesh(storeGeometry, storeMaterial2);
    store2.position.set(200, 0, 200);  // Position on floor 2 (2D)
    floorGroup2.add(store2);
    
    const store3 = new THREE.Mesh(storeGeometry, storeMaterial);
    store3.position.set(300, 0, 300);  // Position on floor 3 (2D)
    floorGroup2.add(store3);

    // Add both floors to the scene
    scene.add(floorGroup1);
    scene.add(floorGroup2);

    return [floorGroup1, floorGroup2];  // Return the floors for switching
}

