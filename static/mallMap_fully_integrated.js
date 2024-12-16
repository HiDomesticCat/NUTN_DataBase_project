import * as THREE from './lib/three.module.js';

// A* Pathfinding with Optimizations
export function findPath(grid, start, end) {
    const [rows, cols] = [grid.length, grid[0].length];
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    if (grid[endRow][endCol] === -1) {
        console.error("Target is unreachable (wall).");
        return null;
    }

    // Limit search space based on start and end positions
    const minRow = Math.max(0, Math.min(startRow, endRow) - 10);
    const maxRow = Math.min(rows - 1, Math.max(startRow, endRow) + 10);
    const minCol = Math.max(0, Math.min(startCol, endCol) - 10);
    const maxCol = Math.min(cols - 1, Math.max(startCol, endCol) + 10);

    // Manhattan distance heuristic
    const heuristic = (r, c) => Math.abs(r - endRow) + Math.abs(c - endCol);

    const openSet = [];
    const cameFrom = {};
    const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));

    gScore[startRow][startCol] = 0;
    fScore[startRow][startCol] = heuristic(startRow, startCol);

    openSet.push([startRow, startCol]);

    while (openSet.length > 0) {
        // Sort open set by fScore
        openSet.sort((a, b) => fScore[a[0]][a[1]] - fScore[b[0]][b[1]]);
        const [currentRow, currentCol] = openSet.shift();

        if (currentRow === endRow && currentCol === endCol) {
            // Reconstruct path
            const path = [];
            let current = `${endRow},${endCol}`;
            while (current) {
                const [r, c] = current.split(',').map(Number);
                path.unshift([r, c]);
                current = cameFrom[current];
            }
            return path;
        }

        // Check neighbors within the limited search space
        const neighbors = [
            [currentRow - 1, currentCol],
            [currentRow + 1, currentCol],
            [currentRow, currentCol - 1],
            [currentRow, currentCol + 1],
        ].filter(([r, c]) => r >= minRow && r <= maxRow && c >= minCol && c <= maxCol && grid[r][c] !== -1);

        for (const [neighborRow, neighborCol] of neighbors) {
            const tentativeGScore = gScore[currentRow][currentCol] + 1; // All moves cost 1

            if (tentativeGScore < gScore[neighborRow][neighborCol]) {
                cameFrom[`${neighborRow},${neighborCol}`] = `${currentRow},${currentCol}`;
                gScore[neighborRow][neighborCol] = tentativeGScore;
                fScore[neighborRow][neighborCol] = tentativeGScore + heuristic(neighborRow, neighborCol);
                if (!openSet.some(([r, c]) => r === neighborRow && c === neighborCol)) {
                    openSet.push([neighborRow, neighborCol]);
                }
            }
        }
    }

    console.error("No path found.");
    return null;
}

// Visualization remains unchanged
export function visualizePath(scene, path) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const points = path.map(([row, col]) => new THREE.Vector3(col, row, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}
