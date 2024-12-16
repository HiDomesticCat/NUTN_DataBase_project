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



// --- Integrated Pathfinding Logic from zoneTravelModule.js ---

// MinHeap Class
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return top;
    }
    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (element.cost >= parent.cost) break;
            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex;
        }
    }
    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swap = null;
            if (leftChildIndex < length) {
                const leftChild = this.heap[leftChildIndex];
                if (leftChild.cost < element.cost) swap = leftChildIndex;
            }
            if (rightChildIndex < length) {
                const rightChild = this.heap[rightChildIndex];
                if (rightChild.cost < (swap === null ? element.cost : this.heap[swap].cost)) {
                    swap = rightChildIndex;
                }
            }
            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            this.heap[swap] = element;
            index = swap;
        }
    }
}

// A* Pathfinding
export function findPath(map, start, end) {
    const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0]
    ];
    const rows = map.length;
    const cols = map[0].length;
    const openSet = new MinHeap();
    const closedSet = new Set();
    openSet.push({
        position: start,
        cost: 0,
        estimated: 0,
        parent: null
    });
    while (openSet.heap.length > 0) {
        const current = openSet.pop();
        const [x, y] = current.position;
        if (x === end[0] && y === end[1]) {
            const path = [];
            let node = current;
            while (node) {
                path.unshift(node.position);
                node = node.parent;
            }
            return path;
        }
        closedSet.add(`${x},${y}`);
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= rows || ny >= cols || map[nx][ny] === -1 || closedSet.has(`${nx},${ny}`)) {
                continue;
            }
            const cost = current.cost + 1;
            const estimated = cost + Math.abs(end[0] - nx) + Math.abs(end[1] - ny);
            openSet.push({
                position: [nx, ny],
                cost,
                estimated,
                parent: current
            });
        }
    }
    return null;
}

// Visualize Path on Three.js Map
export function visualizePath(scene, path) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const points = path.map(([x, y]) => new THREE.Vector3(x, 0, y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// --- End of Integration ---
