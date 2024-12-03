import * as THREE from './lib/three.module.js';

export function handleStoreSearch(storeName, camera, controls, floors, storeLocations) {
    if (storeLocations[storeName]) {
        const { x, y, floor } = storeLocations[storeName];

        // 顯示對應樓層
        floors.forEach((floorGroup, index) => {
            floorGroup.visible = (index === floor);
        });

        try {
            // 平移相機到目標商店的位置，保持 z 軸不變（確保視角不變）
            gsap.to(camera.position, {
                duration: 1,
                x: x,  // 將相機移動到商店的 x 座標
                y: y,  // 將相機移動到商店的 z 座標 (2D 地圖的 y 值對應 z 軸)
                ease: "power1.out",  // 使用平滑效果
                onUpdate: () => {
                    controls.update();  // 確保相機控制器更新
                }
            });

            // 更新相機的目標點，保持在商店位置
            gsap.to(controls.target, {
                duration: 1,
                x: x,  // 將相機目標點移動到商店的 x 座標
                y: 0,
                ease: "power1.out",  // 使用平滑過渡效果
                onUpdate: () => {
                    controls.update();  // 確保控制器更新
                }
            });
        } catch (error) {
            console.error("Error while moving the camera: ", error);
        }
    } else {
        alert("Store not found!");
    }
}

