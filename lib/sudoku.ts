/**
 * Sudoku puzzle generator and solver.
 * Uses backtracking to generate valid puzzles and verify unique solutions.
 */

export type Board = (number | null)[][];
export type Difficulty = "easy" | "medium" | "hard";

const SIZE = 9;
const BOX = 3;

/**
 * Check if placing `num` at (row, col) is valid.
 */
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < SIZE; c++) {
    if (board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < SIZE; r++) {
    if (board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/**
 * Solve the board using backtracking. Returns true if solved.
 */
function solve(board: Board): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Generate a complete valid Sudoku board.
 */
function generateFullBoard(): Board {
  const board: Board = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null)
  );

  // Fill with backtracking + randomized number order
  function fillBoard(board: Board): boolean {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (board[row][col] === null) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillBoard(board);
  return board;
}

/**
 * Count solutions (up to 2) to check uniqueness.
 */
function countSolutions(board: Board, limit: number = 2): number {
  let count = 0;

  function solveCount(board: Board): void {
    if (count >= limit) return;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (board[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              solveCount(board);
              board[row][col] = null;
            }
          }
          return;
        }
      }
    }
    count++;
  }

  solveCount(board);
  return count;
}

/**
 * Remove cells from a full board to create a puzzle with a unique solution.
 */
function removeCells(board: Board, cellsToRemove: number): Board {
  const puzzle: Board = board.map((row) => [...row]);
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    // Check if still has unique solution
    const copy: Board = puzzle.map((r) => [...r]);
    if (countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}

/**
 * Fisher-Yates shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a Sudoku puzzle.
 * Returns the puzzle (with nulls) and the solution.
 */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const cellsToRemove: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 53,
  };

  const solution = generateFullBoard();
  const puzzle = removeCells(solution, cellsToRemove[difficulty]);

  return { puzzle, solution };
}

/**
 * Check if a user's board matches the solution.
 */
export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === null) return false;
    }
  }
  return true;
}

/**
 * Check if a specific cell value is correct.
 */
export function isCellCorrect(
  board: Board,
  solution: Board,
  row: number,
  col: number
): boolean {
  return board[row][col] === solution[row][col];
}

/**
 * Check if the full board is correct (matches solution).
 */
export function isBoardCorrect(board: Board, solution: Board): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}
