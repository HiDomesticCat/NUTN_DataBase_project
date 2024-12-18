import * as THREE from './lib/three.module.js';
import { findPath, visualizePath } from './mallMap_integrated_corrected.js';

// 商品與地圖數據
export const products = [
    { name: "A區", location: [25, 20] },
    { name: "B區", location: [50, 20] },
    { name: "C區", location: [120, 60] },
    { name: "D區", location: [60, 70] },
    { name: "E區", location: [60, 130] }
];
export const rows = 200;
export const cols = 200;
export const mapMatrix = Array.from({ length: rows }, () => Array(cols).fill(0));


//mapMatrix[25][20] = -1; // A
//mapMatrix[50][20] = -1; // B
//mapMatrix[120][60] = -1; // C
//mapMatrix[60][70] = -1; // D
//mapMatrix[60][130] = -1; // E

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

// 模擬 API 查詢，返回商品所在區域
async function fetchProductArea(productName) {
    try {
        const response = await fetch(`/products?name=${encodeURIComponent(productName)}`, {
            headers: {
                "Accept": "application/json"
            },
            credentials: "include" // 發送 cookie，支援身份驗證
        });

        if (!response.ok) {
            throw new Error("Failed to fetch product area.");
        }

        const data = await response.json();
		
        console.log("Product Data:", data);
        return data[0]["Location"]; // 返回商品區域
    } catch (error) {
        console.error("Error fetching product area:", error);
        return null;
    }
}

async function fetchCart() {
    try {
        const response = await fetch('/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

		var cartItems = null;
        if (response.ok) {
            cartItems = await response.json();
            console.log(cartItems);
			if(cartItems.length == 0) {
				alert('未有商品在購物車中');
			}
        } else {
            const error = await response.json();
            alert(error.error || '無法檢視購物車');
        }
		
        return cartItems; // 返回商品區域
    } catch (error) {
        console.error("Error fetching product area:", error);
        return null;
    }
}

export async function handleProductSearch(productName, scene, camera, controls) {
	const carts = await fetchCart();
	let path = [];
	let a = userPosition, b = userPosition;
	let [row, col] = [null,null];
    // 4. 視覺化路徑
    visualizePath(scene, path, true);
	for (const cart in carts) {
		// 1. 查詢商品所在區域
		const productName = carts[cart]["Name"];
		const areaName = await fetchProductArea(productName);
		if (!areaName) {
			console.error(`No area found for product "${productName}".`);
			alert(`Product "${productName}" not found in any area.`);
			return;
		}

		// 2. 查詢區域座標
		const area = products.find(p => p.name === areaName);
		if (!area) {
			console.error(`Area "${areaName}" not found.`);
			alert(`Area "${areaName}" not found.`);
			return;
		}
	    [row, col] = area.location;
	    console.log(`Found "${productName}" in area "${areaName}" at location [${row}, ${col}]`);
		// 3. 計算路線
		b = area.location;
		path = findPath(mapMatrix, a, b);	
		a = area.location;
		if (!path) {
			console.error("No path found to the target area.");
			alert("No path found to the target area.");
			return;
		}
		// 4. 視覺化路徑
		visualizePath(scene, path, false);
	}

    // 5. 移動相機到區域位置
    camera.position.set(col, row, 10); // z 軸固定
    controls.target.set(col, row, 0);  // 聚焦區域位置
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
	loopMakeDoor(100, 50, 125, 55);

	loopMakeWall(100, 85, 140, 104);

	loopMakeWall(100, 121, 140, 140);
	
	loopMakeWall(33, 53, 78, 96);
	loopMakeDoor(55, 53, 60, 53);

	loopMakeWall(10, 123, 70, 140);
	loopMakeDoor(10, 130, 10, 135);

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
