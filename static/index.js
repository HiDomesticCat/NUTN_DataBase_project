import * as THREE from './lib/three.module.js';
import { addControls } from './controls.js';
import { loadStoreData } from './storeLoader.js';
import { handleStoreSearch } from './search.js';
import { handleFloorSwitching } from './controls.js';

// 設置 sidebar 和相機的寬高比
const sidebar = document.querySelector(".sidebar");
const aspect = sidebar.clientWidth / sidebar.clientHeight;

// 初始化相機
const camera = new THREE.OrthographicCamera(-500 * aspect, 500 * aspect, 500, -500, 1, 1000);
camera.position.set(0, 0, 500);  // 初始化相機高度為 500，並居中
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
textureLoader.load('/static/img/IKEA_DALL_E.webp', (texture) => {
    // 創建 2D 平面
    const geometry = new THREE.PlaneGeometry(800, 600); // 800x600 是平面的寬高
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    // 將平面放置在場景中
    plane.position.set(0, 0, 0); // 位於場景的中心
    scene.add(plane);

    // 渲染場景
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    //animate();
});

// 載入商店資料
loadStoreData('/static/stores.xml', scene, camera, (floors, storeLocations) => {
    const controls = addControls(camera, renderer);

    // 處理樓層切換
    handleFloorSwitching(scene, floors);

    // 處理商店搜尋功能
    const searchInput = document.getElementById("storeSearch");
    document.getElementById("searchButton").addEventListener("click", () => {
        const storeName = searchInput.value;
        handleStoreSearch(storeName, camera, controls, floors, storeLocations);
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
});

// 監聽視窗大小改變事件，動態調整渲染器和相機
window.addEventListener('resize', () => {
    const sidebarWidth = sidebar.clientWidth;
    const sidebarHeight = sidebar.clientHeight;

    // 根據新的寬高比調整相機的視角範圍，保持場景比例一致
    const newAspect = sidebarWidth / sidebarHeight;

    camera.left = -500 * newAspect;  // 更新左邊界
    camera.right = 500 * newAspect;  // 更新右邊界
    camera.top = 500;  // 上邊界保持固定
    camera.bottom = -500;  // 下邊界保持固定

    // 更新相機的縮放級別，避免物體在視窗調整後被拉伸
    camera.zoom = 1;  // 確保縮放級別為 1（固定比例）
    camera.updateProjectionMatrix();  // 更新投影矩陣

    // 更新渲染器的尺寸，保持與 sidebar 一致
    renderer.setSize(sidebarWidth, sidebarHeight);

    // 重新渲染
    renderer.render(scene, camera);
});

