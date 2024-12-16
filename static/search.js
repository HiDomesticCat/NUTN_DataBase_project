import * as THREE from './lib/three.module.js';
import { findPath, visualizePath } from './mallMap_fully_integrated.js';

// 商品與地圖數據
export const products = [
    { name: "Apple", location: [20, 15] },
    { name: "Laptop", location: [8, 2] },
    { name: "Desk Chair", location: [1, 1] }
];
export const rows = 200;
export const cols = 200;
export const mapMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));

mapMatrix[30][20] = -1;

export function visualizeObstacles(scene, matrix) {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
            if (matrix[r][c] === -1) {
                const obstacle = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial({ color: 0xff0000 }) // 使用紅色表示障礙物
                );
                obstacle.position.set(c, r, 0); // x 對應列，y 對應行
                scene.add(obstacle);
            }
        }
    }
}

// 可視化障礙物
// visualizeObstacles(scene, mapMatrix);


// 當前位置（入口位置）
export const userPosition = [10, 70];

// 商品查詢邏輯
export function handleProductSearch(productName, scene, camera, controls) {
    const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (!product) {
        console.error(`Product "${productName}" not found.`);
        alert(`Product "${productName}" not found.`);
        return;
    }

    const [row, col] = product.location;
    console.log(`Found product "${productName}" at location [${row}, ${col}]`);

    // 計算路線
    const path = findPath(mapMatrix, userPosition, product.location);
    if (!path) {
        console.error('No path found to the product location.');
        alert('No path found to the product location.');
        return;
    }

    // 視覺化路徑
    visualizePath(scene, path);

    // 移動相機到商品位置
    camera.position.set(col, row, 10); // z 軸固定
    controls.target.set(col, row, 0); // 聚焦商品位置
    controls.update();
}

export function wallCreate() {
	// 手動增加障礙物
	
	loopMakeWall(4, 4, 147, 147);
	
	loopMakeWall(11, 10, 34, 26);
	loopMakeDoor(20, 10, 25, 10);

	loopMakeWall(45, 8, 58, 27);
	loopMakeDoor(45, 15, 45, 20);

	loopMakeWall(70, 8, 88, 27);

	loopMakeWall(100, 8, 140, 27);

	loopMakeWall(100, 48, 140, 67);

	loopMakeWall(100, 85, 140, 104);

	loopMakeWall(100, 121, 140, 140);
	
	loopMakeWall(33, 53, 78, 96);

	loopMakeWall(10, 123, 70, 140);


}

function loopMakeWall(sX, sY, eX, eY) {
	for (let i = sX; i <= eX; i++) {
		mapMatrix[i][sY] = -1;
	}
	for (let i = sX; i <= eX; i++) {
		mapMatrix[i][eY] = -1;
	}
	for (let i = sY; i <= eY; i++) {
		mapMatrix[sX][i] = -1;
	}
	for (let i = sY; i <= eY; i++) {
		mapMatrix[eX][i] = -1;
	}
}


function loopMakeDoor(sX, sY, eX, eY) {
	for (let i = sX; i <= eX; i++) {
		mapMatrix[i][sY] = 0;
	}
	for (let i = sX; i <= eX; i++) {
		mapMatrix[i][eY] = 0;
	}
	for (let i = sY; i <= eY; i++) {
		mapMatrix[sX][i] = 0;
	}
	for (let i = sY; i <= eY; i++) {
		mapMatrix[eX][i] = 0;
	}
}
