"use client";

import { useState, useCallback, useEffect } from "react";
import {
  generatePuzzle,
  isBoardComplete,
  isBoardCorrect,
  type Board,
  type Difficulty,
} from "@/lib/sudoku";
import { playTone, playAscending } from "@/lib/sound";
import { hapticTap, hapticMedium, hapticCelebration } from "@/lib/haptic";

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [solution, setSolution] = useState<Board | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [won, setWon] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [helpEnabled, setHelpEnabled] = useState(true);

  const newGame = useCallback((diff: Difficulty) => {
    setGenerating(true);
    setWon(false);
    setSelected(null);
    setErrors(new Set());
    // Use setTimeout to let the UI update before heavy computation
    setTimeout(() => {
      const { puzzle: p, solution: s } = generatePuzzle(diff);
      setPuzzle(p);
      setSolution(s);
      setBoard(p.map((row) => [...row]));
      setDifficulty(diff);
      setGenerating(false);
    }, 50);
  }, []);

  useEffect(() => {
    newGame("easy");
  }, [newGame]);

  const handleCellClick = (row: number, col: number) => {
    if (won) return;
    // Can't select given cells
    if (puzzle && puzzle[row][col] !== null) {
      setSelected([row, col]);
      hapticTap();
      return;
    }
    setSelected([row, col]);
    hapticTap();
  };

  const handleNumberInput = (num: number) => {
    if (!selected || !board || !solution || !puzzle || won) return;
    const [row, col] = selected;

    // Can't change given cells
    if (puzzle[row][col] !== null) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    const newErrors = new Set(errors);
    const key = `${row}-${col}`;

    if (num !== solution[row][col]) {
      newErrors.add(key);
      if (helpEnabled) {
        playTone(200, 0.2, "sawtooth");
      }
    } else {
      newErrors.delete(key);
      playTone(440 + num * 40, 0.1);
      hapticMedium();
    }
    setErrors(newErrors);

    // Check win
    if (isBoardComplete(newBoard) && isBoardCorrect(newBoard, solution)) {
      setWon(true);
      hapticCelebration();
      playAscending(400, 5);
    }
  };

  const handleErase = () => {
    if (!selected || !board || !puzzle || won) return;
    const [row, col] = selected;
    if (puzzle[row][col] !== null) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = null;
    setBoard(newBoard);

    const newErrors = new Set(errors);
    newErrors.delete(`${row}-${col}`);
    setErrors(newErrors);
    hapticTap();
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selected) return false;
    const [sr, sc] = selected;
    // Same row, col, or box
    return (
      row === sr ||
      col === sc ||
      (Math.floor(row / 3) === Math.floor(sr / 3) &&
        Math.floor(col / 3) === Math.floor(sc / 3))
    );
  };

  const isSameNumber = (row: number, col: number): boolean => {
    if (!selected || !board) return false;
    const [sr, sc] = selected;
    const selectedVal = board[sr][sc];
    return selectedVal !== null && board[row][col] === selectedVal;
  };

  if (!board || !puzzle || generating) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Generating puzzle...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-2 overflow-hidden select-none">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Sudoku</h1>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-3">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => newGame(d)}
            className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
              difficulty === d && !won
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setHelpEnabled((prev) => !prev)}
          className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
            helpEnabled
              ? "bg-green-700 text-green-100 hover:bg-green-600"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
          aria-label={helpEnabled ? "Disable help" : "Enable help"}
          title={helpEnabled ? "Help: ON – errors are highlighted" : "Help: OFF – no error feedback"}
        >
          {helpEnabled ? "💡 Help" : "🚫 Help"}
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-9 border-2 border-gray-400 rounded overflow-hidden">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isGiven = puzzle[rowIdx][colIdx] !== null;
            const isSelected =
              selected?.[0] === rowIdx && selected?.[1] === colIdx;
            const highlighted = isHighlighted(rowIdx, colIdx);
            const sameNum = isSameNumber(rowIdx, colIdx);
            const hasError = errors.has(`${rowIdx}-${colIdx}`);

            let bg = "bg-gray-800";
            if (isSelected) bg = "bg-blue-700";
            else if (sameNum) bg = "bg-blue-900";
            else if (highlighted) bg = "bg-gray-700";

            // Box borders
            const borderRight =
              colIdx % 3 === 2 && colIdx < 8
                ? "border-r-2 border-r-gray-400"
                : "border-r border-r-gray-700";
            const borderBottom =
              rowIdx % 3 === 2 && rowIdx < 8
                ? "border-b-2 border-b-gray-400"
                : "border-b border-b-gray-700";

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                className={`
                  w-[36px] h-[36px] sm:w-[44px] sm:h-[44px]
                  flex items-center justify-center
                  text-sm sm:text-lg font-semibold
                  transition-colors
                  ${bg} ${borderRight} ${borderBottom}
                  ${isGiven ? "text-white" : hasError && helpEnabled ? "text-red-400" : "text-blue-300"}
                  ${!isGiven && !won ? "cursor-pointer" : ""}
                `}
                aria-label={`Cell row ${rowIdx + 1} column ${colIdx + 1}${cell ? ` value ${cell}` : " empty"}`}
              >
                {cell || ""}
              </button>
            );
          })
        )}
      </div>

      {/* Number pad */}
      {!won && (
        <div className="flex gap-1 sm:gap-2 mt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-[32px] h-[40px] sm:w-[40px] sm:h-[48px] bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-bold rounded text-sm sm:text-lg transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleErase}
            className="w-[32px] h-[40px] sm:w-[40px] sm:h-[48px] bg-red-900 hover:bg-red-800 active:bg-red-700 text-white font-bold rounded text-sm sm:text-lg transition-colors"
            aria-label="Erase"
          >
            ✕
          </button>
        </div>
      )}

      {/* Win state */}
      {won && (
        <div className="mt-6 py-4 px-6 text-center rounded-xl bg-gray-800/80 border border-yellow-500/30">
          <p className="text-2xl font-bold text-yellow-400 mb-1 animate-pulse">
            🎉 Well done!
          </p>
          <p className="text-sm text-gray-300 mb-3">
            You crushed the {difficulty} puzzle. Ready for another?
          </p>
          <button
            onClick={() => newGame(difficulty)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Build tag + Report Bug */}
      <div className="absolute bottom-2 flex items-center gap-3">
        <a
          href="https://github.com/geea-develop/sudoku/issues/new?template=bug_report.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-300 text-xs underline"
        >
          Report Bug
        </a>
        <span className="text-gray-700 text-[10px]">
          build {process.env.NEXT_PUBLIC_BUILD_ID?.slice(0, 7) || "local"} 🎯
        </span>
      </div>
    </div>
  );
}
