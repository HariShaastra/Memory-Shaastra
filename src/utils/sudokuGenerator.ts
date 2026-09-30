// Mini Sudoku Generator & Solver for Daily Boost

export interface SudokuPuzzle {
  size: 4 | 6;
  boxRows: number;
  boxCols: number;
  initialBoard: number[][]; // 0 for empty
  solution: number[][];
  clueCount: number;
}

// Generate valid 4x4 base board
const BASE_4X4: number[][] = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

// Generate valid 6x6 base board (2x3 boxes)
const BASE_6X6: number[][] = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 1, 5, 6, 4],
  [5, 6, 4, 2, 3, 1],
  [3, 1, 2, 6, 4, 5],
  [6, 4, 5, 3, 1, 2]
];

// Shuffle array utility
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateMiniSudoku(size: 4 | 6 = 4, difficulty: 'easy' | 'medium' = 'easy'): SudokuPuzzle {
  if (size === 4) {
    const boxRows = 2;
    const boxCols = 2;
    let board = BASE_4X4.map(row => [...row]);

    // 1. Random digit substitution
    const digits = shuffle([1, 2, 3, 4]);
    board = board.map(row => row.map(val => digits[val - 1]));

    // 2. Randomly swap rows within band 1 (rows 0, 1) and band 2 (rows 2, 3)
    if (Math.random() > 0.5) {
      [board[0], board[1]] = [board[1], board[0]];
    }
    if (Math.random() > 0.5) {
      [board[2], board[3]] = [board[3], board[2]];
    }

    // 3. Randomly swap row bands
    if (Math.random() > 0.5) {
      const temp1 = board[0];
      const temp2 = board[1];
      board[0] = board[2];
      board[1] = board[3];
      board[2] = temp1;
      board[3] = temp2;
    }

    // 4. Randomly swap columns within stack
    if (Math.random() > 0.5) {
      for (let r = 0; r < 4; r++) {
        const tmp = board[r][0];
        board[r][0] = board[r][1];
        board[r][1] = tmp;
      }
    }
    if (Math.random() > 0.5) {
      for (let r = 0; r < 4; r++) {
        const tmp = board[r][2];
        board[r][2] = board[r][3];
        board[r][3] = tmp;
      }
    }

    const solution = board.map(row => [...row]);
    const initialBoard = board.map(row => [...row]);

    // Remove cells based on difficulty
    // 4x4 has 16 cells.
    // Easy: remove 7 cells (9 clues)
    // Medium: remove 9 cells (7 clues)
    const removeCount = difficulty === 'easy' ? 7 : 9;
    const allCoords: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        allCoords.push([r, c]);
      }
    }
    const shuffledCoords = shuffle(allCoords);
    for (let i = 0; i < removeCount; i++) {
      const [r, c] = shuffledCoords[i];
      initialBoard[r][c] = 0;
    }

    const clueCount = 16 - removeCount;
    return {
      size: 4,
      boxRows: 2,
      boxCols: 2,
      initialBoard,
      solution,
      clueCount
    };
  } else {
    // 6x6 Sudoku
    const boxRows = 2;
    const boxCols = 3;
    let board = BASE_6X6.map(row => [...row]);

    // 1. Random digit substitution
    const digits = shuffle([1, 2, 3, 4, 5, 6]);
    board = board.map(row => row.map(val => digits[val - 1]));

    // 2. Randomly swap rows within bands (band 0: 0,1; band 1: 2,3; band 2: 4,5)
    for (let band = 0; band < 3; band++) {
      if (Math.random() > 0.5) {
        const r1 = band * 2;
        const r2 = band * 2 + 1;
        [board[r1], board[r2]] = [board[r2], board[r1]];
      }
    }

    // 3. Randomly swap columns within stacks (stack 0: 0,1,2; stack 1: 3,4,5)
    for (let stack = 0; stack < 2; stack++) {
      const colOrder = shuffle([0, 1, 2]);
      const baseCol = stack * 3;
      const originalCols = [0, 1, 2].map(c => board.map(r => r[baseCol + c]));
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 3; c++) {
          board[r][baseCol + c] = originalCols[colOrder[c]][r];
        }
      }
    }

    const solution = board.map(row => [...row]);
    const initialBoard = board.map(row => [...row]);

    // 6x6 has 36 cells.
    // Easy: remove 16 cells (20 clues)
    // Medium: remove 20 cells (16 clues)
    const removeCount = difficulty === 'easy' ? 16 : 20;
    const allCoords: [number, number][] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        allCoords.push([r, c]);
      }
    }
    const shuffledCoords = shuffle(allCoords);
    for (let i = 0; i < removeCount; i++) {
      const [r, c] = shuffledCoords[i];
      initialBoard[r][c] = 0;
    }

    return {
      size: 6,
      boxRows: 2,
      boxCols: 3,
      initialBoard,
      solution,
      clueCount: 36 - removeCount
    };
  }
}

// Validation function: checks if a placement has conflicts
export function getSudokuConflicts(
  board: number[][],
  size: 4 | 6,
  boxRows: number,
  boxCols: number
): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Check rows
  for (let r = 0; r < size; r++) {
    const seen: Record<number, number[]> = {};
    for (let c = 0; c < size; c++) {
      const val = board[r][c];
      if (val > 0) {
        if (!seen[val]) seen[val] = [];
        seen[val].push(c);
      }
    }
    Object.values(seen).forEach(cols => {
      if (cols.length > 1) {
        cols.forEach(c => (conflicts[r][c] = true));
      }
    });
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    const seen: Record<number, number[]> = {};
    for (let r = 0; r < size; r++) {
      const val = board[r][c];
      if (val > 0) {
        if (!seen[val]) seen[val] = [];
        seen[val].push(r);
      }
    }
    Object.values(seen).forEach(rows => {
      if (rows.length > 1) {
        rows.forEach(r => (conflicts[r][c] = true));
      }
    });
  }

  // Check boxes
  for (let br = 0; br < size; br += boxRows) {
    for (let bc = 0; bc < size; bc += boxCols) {
      const seen: Record<number, [number, number][]> = {};
      for (let r = br; r < br + boxRows; r++) {
        for (let c = bc; c < bc + boxCols; c++) {
          const val = board[r][c];
          if (val > 0) {
            if (!seen[val]) seen[val] = [];
            seen[val].push([r, c]);
          }
        }
      }
      Object.values(seen).forEach(coords => {
        if (coords.length > 1) {
          coords.forEach(([r, c]) => (conflicts[r][c] = true));
        }
      });
    }
  }

  return conflicts;
}

export function isSudokuComplete(board: number[][], solution: number[][]): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}
