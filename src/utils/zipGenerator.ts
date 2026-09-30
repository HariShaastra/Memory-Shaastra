// ZIP Brain Puzzle Generator & Validator

export interface ZipCellCoord {
  r: number;
  c: number;
}

export interface ZipCheckpoint {
  r: number;
  c: number;
  number: number;
}

export interface ZipPuzzle {
  rows: number;
  cols: number;
  checkpoints: ZipCheckpoint[]; // The numbered nodes e.g. 1, 2, 3, 4, 5
  hamiltonianPath: ZipCellCoord[]; // Full valid solution path
  startCoord: ZipCellCoord;
  totalCells: number;
}

function getNeighbors(r: number, c: number, rows: number, cols: number): ZipCellCoord[] {
  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 }
  ];
  return dirs
    .map(d => ({ r: r + d.r, c: c + d.c }))
    .filter(coord => coord.r >= 0 && coord.r < rows && coord.c >= 0 && coord.c < cols);
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Warnsdorff heuristic Hamiltonian Path Finder
function findHamiltonianPath(rows: number, cols: number): ZipCellCoord[] | null {
  const total = rows * cols;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  const startR = Math.floor(Math.random() * rows);
  const startC = Math.floor(Math.random() * cols);

  const path: ZipCellCoord[] = [{ r: startR, c: startC }];
  visited[startR][startC] = true;

  function countUnvisitedNeighbors(curr: ZipCellCoord): number {
    const neighbors = getNeighbors(curr.r, curr.c, rows, cols);
    return neighbors.filter(n => !visited[n.r][n.c]).length;
  }

  function dfs(curr: ZipCellCoord): boolean {
    if (path.length === total) {
      return true;
    }

    const neighbors = getNeighbors(curr.r, curr.c, rows, cols).filter(n => !visited[n.r][n.c]);
    if (neighbors.length === 0) return false;

    // Sort neighbors by fewest onward unvisited neighbors (Warnsdorff's rule), with random tie-breaker
    const shuffled = shuffle(neighbors);
    shuffled.sort((a, b) => countUnvisitedNeighbors(a) - countUnvisitedNeighbors(b));

    for (const next of shuffled) {
      visited[next.r][next.c] = true;
      path.push(next);

      if (dfs(next)) return true;

      // Backtrack
      visited[next.r][next.c] = false;
      path.pop();
    }

    return false;
  }

  const success = dfs({ r: startR, c: startC });
  return success ? path : null;
}

export function generateZipPuzzle(gridSize: 4 | 5 = 4): ZipPuzzle {
  const rows = gridSize;
  const cols = gridSize;
  const total = rows * cols;

  let path: ZipCellCoord[] | null = null;
  let attempts = 0;
  while (!path && attempts < 50) {
    path = findHamiltonianPath(rows, cols);
    attempts++;
  }

  // Fallback snake path if random fails (guaranteed Hamiltonian path)
  if (!path) {
    path = [];
    for (let r = 0; r < rows; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < cols; c++) path.push({ r, c });
      } else {
        for (let c = cols - 1; c >= 0; c--) path.push({ r, c });
      }
    }
  }

  // Select checkpoints along the path
  // For 4x4 (16 cells): 4 or 5 checkpoints (e.g. 1, 2, 3, 4, 5)
  // For 5x5 (25 cells): 5 or 6 checkpoints (e.g. 1, 2, 3, 4, 5, 6)
  const numCheckpoints = gridSize === 4 ? 4 : 5;
  const stepInterval = Math.floor((total - 1) / (numCheckpoints - 1));

  const checkpoints: ZipCheckpoint[] = [];
  for (let i = 0; i < numCheckpoints; i++) {
    const pathIdx = i === numCheckpoints - 1 ? total - 1 : i * stepInterval;
    const coord = path[pathIdx];
    checkpoints.push({
      r: coord.r,
      c: coord.c,
      number: i + 1
    });
  }

  return {
    rows,
    cols,
    checkpoints,
    hamiltonianPath: path,
    startCoord: path[0],
    totalCells: total
  };
}

export function isOrthogonalNeighbor(a: ZipCellCoord, b: ZipCellCoord): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}
