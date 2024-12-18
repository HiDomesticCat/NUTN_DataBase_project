import * as THREE from './lib/three.module.js';

// 優化後的 A* 路徑尋找算法
class MinHeap {
    constructor() {
        this.heap = [];
    }

    // 插入新元素
    push(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    // 移除並返回最小元素
    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.bubbleDown(0);
        }
        return min;
    }

    // 返回最小元素但不移除
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    size() {
        return this.heap.length;
    }

    bubbleUp(index) {
        const node = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (node.fScore >= parent.fScore) break;
            this.heap[parentIndex] = node;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        const length = this.heap.length;
        const node = this.heap[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let swap = null;

            if (leftChildIdx < length) {
                const leftChild = this.heap[leftChildIdx];
                if (leftChild.fScore < node.fScore) {
                    swap = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                const rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && rightChild.fScore < node.fScore) ||
                    (swap !== null && rightChild.fScore < this.heap[swap].fScore)
                ) {
                    swap = rightChildIdx;
                }
            }

            if (swap === null) break;

            this.heap[index] = this.heap[swap];
            this.heap[swap] = node;
            index = swap;
        }
    }
}

export function findPath(grid, start, end) {
    const [rows, cols] = [grid.length, grid[0].length];
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    if (grid[endRow][endCol] === -1) {
        console.error("目標不可達（牆壁阻擋）。");
        return null;
    }

    if (startRow === endRow && startCol === endCol) {
        return [[startRow, startCol]];
    }

    // 曼哈頓距離啟發函數
    const heuristic = (r, c) => Math.abs(r - endRow) + Math.abs(c - endCol);

    // 初始化 gScore 和 fScore 為二維數組
    const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));

    gScore[startRow][startCol] = 0;
    fScore[startRow][startCol] = heuristic(startRow, startCol);

    // 使用二維數組存儲 cameFrom 信息
    const cameFrom = Array.from({ length: rows }, () => Array(cols).fill(null));

    // 初始化優先隊列並加入起點
    const openSet = new MinHeap();
    openSet.push({ row: startRow, col: startCol, fScore: fScore[startRow][startCol] });

    // 用於檢查節點是否在 openSet 中
    const inOpenSet = Array.from({ length: rows }, () => Array(cols).fill(false));
    inOpenSet[startRow][startCol] = true;

    // 定義四個可能的移動方向（上下左右）
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    while (openSet.size() > 0) {
        const current = openSet.pop();
        inOpenSet[current.row][current.col] = false;

        if (current.row === endRow && current.col === endCol) {
            // 重建路徑
            const path = [];
            let r = endRow;
            let c = endCol;
            while (r !== startRow || c !== startCol) {
                path.unshift([r, c]);
                const prev = cameFrom[r][c];
                if (!prev) break; // 防止無限循環
                [r, c] = prev;
            }
            path.unshift([startRow, startCol]);
            return path;
        }

        for (const [dr, dc] of directions) {
            const neighborRow = current.row + dr;
            const neighborCol = current.col + dc;

            // 檢查邊界和牆壁
            if (
                neighborRow < 0 ||
                neighborRow >= rows ||
                neighborCol < 0 ||
                neighborCol >= cols ||
                grid[neighborRow][neighborCol] === -1
            ) {
                continue;
            }

            const tentativeGScore = gScore[current.row][current.col] + 1; // 所有移動成本為 1

            if (tentativeGScore < gScore[neighborRow][neighborCol]) {
                cameFrom[neighborRow][neighborCol] = [current.row, current.col];
                gScore[neighborRow][neighborCol] = tentativeGScore;
                fScore[neighborRow][neighborCol] = tentativeGScore + heuristic(neighborRow, neighborCol);

                if (!inOpenSet[neighborRow][neighborCol]) {
                    openSet.push({
                        row: neighborRow,
                        col: neighborCol,
                        fScore: fScore[neighborRow][neighborCol],
                    });
                    inOpenSet[neighborRow][neighborCol] = true;
                }
            }
        }
    }

    console.error("Path not found");
    return null;
}

let currentPathLine = null; // 用於保存當前路徑線條的全局變數
let tmpPaths = [];

export function visualizePath(scene, path, clear) {
    // 清除舊的路徑
    if (clear) {
		for (const i in tmpPaths) {
			scene.remove(tmpPaths[i]); // 從場景中移除舊的路徑線
			tmpPaths[i].geometry.dispose(); // 釋放幾何體記憶體
			tmpPaths[i].material.dispose(); // 釋放材質記憶體
		}
		tmpPaths = [];
    }

    // 繪製新的路徑
    const material = new THREE.LineBasicMaterial({ color: Math.floor(Math.random() * 0xffffff) });
    const points = path.map(([row, col]) => new THREE.Vector3(col, row, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    currentPathLine = new THREE.Line(geometry, material);
	tmpPaths.push(currentPathLine);

    scene.add(currentPathLine); // 添加新路徑到場景
}
