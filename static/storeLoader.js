import * as THREE from './lib/three.module.js';

export function loadStoreData(xmlPath, scene, camera, callback) {
    fetch(xmlPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load XML file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            const floors = [];
            const storeLocations = {};  // 存放商店位置資料

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            const stores = xmlDoc.getElementsByTagName("store");
            if (stores.length === 0) {
                console.warn("No stores found in XML file.");
            }

            for (let i = 0; i < stores.length; i++) {
                const store = stores[i];

                // 檢查商店名稱是否存在
                const nameElement = store.getElementsByTagName("name")[0];
                if (!nameElement || !nameElement.textContent) {
                    console.warn(`Store ${i + 1} has no name defined.`);
                    continue;
                }
                const name = nameElement.textContent;

                // 檢查形狀是否存在
                const shapeElement = store.getElementsByTagName("shape")[0];
                if (!shapeElement || !shapeElement.textContent) {
                    console.warn(`Store ${name} has no shape defined.`);
                    continue;
                }
                const shapeType = shapeElement.textContent;

                // 檢查位置是否存在
                const pos = store.getElementsByTagName("position")[0];
                if (!pos || !pos.getAttribute("x") || !pos.getAttribute("y") || !pos.getAttribute("floor")) {
                    console.warn(`Store ${name} has invalid or missing position data.`);
                    continue;
                }
                const x = parseFloat(pos.getAttribute("x"));
                const y = parseFloat(pos.getAttribute("y"));
                const floor = parseInt(pos.getAttribute("floor"));

                // 取得顏色資訊
                const colorElement = store.getElementsByTagName("color")[0];
                let color = 0x00FF00;  // 預設顏色為綠色
                if (colorElement && colorElement.textContent) {
                    color = parseInt(colorElement.textContent.replace("#", "0x"), 16);  // 將顏色轉換為十六進制
                }

                storeLocations[name] = { x, y, floor };  // 保存商店位置信息

                // 更新最大和最小的 x 和 y 來計算商店的範圍
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);

                let mesh;
                // 處理多邊形形狀
                if (shapeType === "polygon") {
                    const vertices = store.getElementsByTagName("vertex");
                    if (vertices.length < 3) {
                        console.warn(`Store ${name} has invalid polygon with less than 3 vertices.`);
                        continue;
                    }
                    const points = [];
                    for (let j = 0; j < vertices.length; j++) {
                        const vx = parseFloat(vertices[j].getAttribute("x"));
                        const vy = parseFloat(vertices[j].getAttribute("y"));
                        if (isNaN(vx) || isNaN(vy)) {
                            console.warn(`Invalid vertex coordinates for store ${name}.`);
                            continue;
                        }
                        points.push(new THREE.Vector2(vx, vy));  // 添加多邊形的頂點
                    }

                    // 使用 Shape 將點連接起來，構建多邊形形狀
                    const shape = new THREE.Shape(points);
                    const geometry = new THREE.ShapeGeometry(shape);
                    const material = new THREE.MeshBasicMaterial({
                        color: color,  // 使用 XML 中的顏色
                        side: THREE.DoubleSide // 確保雙面可見
                    });
                    mesh = new THREE.Mesh(geometry, material);
                } else {
                    console.warn(`Unknown shape type ${shapeType} for store ${name}.`);
                    continue;
                }

                // 確保 mesh 不為空
                if (mesh) {
                    // 設置多邊形的位置，並將 y 軸轉換為 z 軸（適應 2D 繪圖）
                    mesh.position.set(x, 0, y);

                    if (!floors[floor]) {
                        floors[floor] = new THREE.Group();
                    }
                    floors[floor].add(mesh);  // 添加商店到對應樓層
                }
            }

            // 添加每一層樓的商店到場景中
            floors.forEach(floorGroup => {
                scene.add(floorGroup);
            });

            callback(floors, storeLocations);
        })
        .catch(error => console.error("Failed to load store data:", error));
}

