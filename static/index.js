import * as THREE from './lib/three.module.js';
import { addControls } from './controls.js';
//import { loadStoreData } from './storeLoader.js';
import { handleProductSearch, products, visualizeObstacles, mapMatrix, wallCreate } from './search.js';
import { handleFloorSwitching } from './controls.js';
import { OrbitControls } from './lib/OrbitControls.js';

// 設置 sidebar 和相機的寬高比
const sidebar = document.querySelector(".sidebar");
const aspect = sidebar.clientWidth / sidebar.clientHeight;

// 初始化相機
const camera = new THREE.OrthographicCamera(-500 * aspect, 500 * aspect, 500, -500, 1, 1000);
camera.position.set(0, 0, 10);  // 初始化相機高度為 10，並居中
camera.lookAt(0, 0, 0);  // 保持 z 軸為 0，以保持 2D 視圖

// 初始化場景和渲染器
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // 設置背景顏色為白色
const renderer = new THREE.WebGLRenderer({ antialias: true });  // 啟用抗鋸齒
renderer.setPixelRatio(window.devicePixelRatio);  // 適應高分辨率
renderer.setSize(sidebar.clientWidth, sidebar.clientHeight);  // 渲染器大小設置為 sidebar 的寬和高
sidebar.appendChild(renderer.domElement);  // 將渲染器添加到 sidebar 中

// 載入圖片作為背景
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/static/img/map.drawio.png', (texture) => {
    // 創建 2D 平面
    const mapWidth = 300; // 地圖的寬度（格子數）
    const mapHeight = 300; // 地圖的高度（格子數）
    const gridSize = 0.5; // 每個格子的尺寸

    const planeWidth = mapWidth * gridSize;
    const planeHeight = mapHeight * gridSize;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight); // 背景大小與地圖一致
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    // 將平面放置在場景中
    plane.position.set(planeWidth / 2, planeHeight / 2, -1); // 位於地圖下方一層
    scene.add(plane);

    // 處理商品搜尋功能
    const searchInput = document.getElementById("productSearch");
    document.getElementById("searchButton").addEventListener("click", () => {
        const productName = searchInput.value;
        handleProductSearch(productName, scene, camera, controls); // 傳入必要參數
    });

	wallCreate();

    // 添加控制器
    const controls = addControls(camera, renderer);

	camera.position.set(75, 75, 10); // z 軸固定
    controls.target.set(75, 75, 0);  // 聚焦區域位置
    controls.update();

    // 渲染場景
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    adjustCameraAndRenderer();
});

function adjustCameraAndRenderer() {
    const sidebarWidth = sidebar.clientWidth;
    const sidebarHeight = sidebar.clientHeight;

    // 根據新的寬高比調整相機的視角範圍，保持場景比例一致
    const newAspect = sidebarWidth / sidebarHeight;

    camera.left = -100 * newAspect;  // 更新左邊界
    camera.right = 100 * newAspect;  // 更新右邊界
    camera.top = 100;  // 上邊界保持固定
    camera.bottom = -100;  // 下邊界保持固定

    // 更新相機的縮放級別，避免物體在視窗調整後被拉伸
    camera.zoom = 1.5;  // 確保縮放級別
    camera.updateProjectionMatrix();  // 更新投影矩陣
    
    // visualizeObstacles(scene, mapMatrix);

    // 更新渲染器的尺寸，保持與 sidebar 一致
    renderer.setSize(sidebarWidth, sidebarHeight);

    // 重新渲染場景
    renderer.render(scene, camera);
}

// 監聽視窗大小改變事件，動態調整渲染器和相機
window.addEventListener('resize', adjustCameraAndRenderer);
