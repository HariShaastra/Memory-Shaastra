import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Zap, 
  Trophy, 
  Timer, 
  RefreshCw, 
  HelpCircle, 
  Brain,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Grid3X3,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { 
  generateMiniSudoku, 
  getSudokuConflicts, 
  isSudokuComplete, 
  SudokuPuzzle 
} from '../utils/sudokuGenerator';
import { 
  generateZipPuzzle, 
  isOrthogonalNeighbor, 
  ZipPuzzle, 
  ZipCellCoord 
} from '../utils/zipGenerator';

type DailyBoostTab = 'inner-blaze' | 'zip' | 'sudoku';
type BlazeState = 'idle' | 'playing' | 'result';

export const MemoryBoost: React.FC = () => {
  const { goBack, updateStreak, addXp } = useAppContext();
  const [activeTab, setActiveTab] = useState<DailyBoostTab>('zip');

  // ==========================================
  // 1. INNER BLAZE STATE (Flash Digit Recall)
  // ==========================================
  const [blazeState, setBlazeState] = useState<BlazeState>('idle');
  const [blazeScore, setBlazeScore] = useState(0);
  const [blazeTimeLeft, setBlazeTimeLeft] = useState(30);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [blazeInput, setBlazeInput] = useState('');
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    let timer: any;
    if (blazeState === 'playing' && blazeTimeLeft > 0) {
      timer = setInterval(() => setBlazeTimeLeft(prev => prev - 1), 1000);
    } else if (blazeTimeLeft === 0 && blazeState === 'playing') {
      handleBlazeComplete();
    }
    return () => clearInterval(timer);
  }, [blazeState, blazeTimeLeft]);

  const startBlazeGame = () => {
    setBlazeState('playing');
    setBlazeScore(0);
    setBlazeTimeLeft(30);
    nextBlazeNumber();
  };

  const nextBlazeNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setTargetNumber(num);
    setShowNumber(true);
    setBlazeInput('');
    setTimeout(() => setShowNumber(false), 1500);
  };

  const checkBlazeNumber = () => {
    if (parseInt(blazeInput) === targetNumber) {
      setBlazeScore(prev => prev + 10);
      nextBlazeNumber();
    } else {
      handleBlazeComplete();
    }
  };

  const handleBlazeComplete = () => {
    setBlazeState('result');
    if (updateStreak) updateStreak();
    if (addXp) addXp(25);
  };

  // ==========================================
  // 2. ZIP GRID PUZZLE STATE
  // ==========================================
  const [zipSize, setZipSize] = useState<4 | 5>(4);
  const [zipPuzzle, setZipPuzzle] = useState<ZipPuzzle>(() => generateZipPuzzle(4));
  const [zipPath, setZipPath] = useState<ZipCellCoord[]>([]);
  const [zipSolved, setZipSolved] = useState(false);
  const [zipMessage, setZipMessage] = useState<string>('Tap cell 1 to begin zipping!');
  const [zipTimer, setZipTimer] = useState(0);
  const [zipTimerRunning, setZipTimerRunning] = useState(false);

  // Initialize ZIP board on mount / size change
  const startNewZip = useCallback((size: 4 | 5 = zipSize) => {
    const p = generateZipPuzzle(size);
    setZipPuzzle(p);
    setZipPath([p.startCoord]);
    setZipSolved(false);
    setZipMessage('Start from 1 and connect to 2, 3... filling every cell!');
    setZipTimer(0);
    setZipTimerRunning(true);
  }, [zipSize]);

  useEffect(() => {
    startNewZip(zipSize);
  }, [zipSize]);

  // ZIP Timer
  useEffect(() => {
    let t: any;
    if (zipTimerRunning && !zipSolved) {
      t = setInterval(() => setZipTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(t);
  }, [zipTimerRunning, zipSolved]);

  // Find checkpoint at coordinate
  const getCheckpoint = (r: number, c: number) => {
    return zipPuzzle.checkpoints.find(cp => cp.r === r && cp.c === c);
  };

  // Find step index in path
  const getPathIndex = (r: number, c: number) => {
    return zipPath.findIndex(p => p.r === r && p.c === c);
  };

  // Next required checkpoint number
  const getNextRequiredCheckpointNumber = (currentPath: ZipCellCoord[]): number => {
    let highestVisitedCp = 0;
    for (const coord of currentPath) {
      const cp = getCheckpoint(coord.r, coord.c);
      if (cp && cp.number > highestVisitedCp) {
        highestVisitedCp = cp.number;
      }
    }
    return highestVisitedCp + 1;
  };

  // Handle cell click / interaction in ZIP
  const handleZipCellClick = (r: number, c: number) => {
    if (zipSolved) return;

    const existingIndex = getPathIndex(r, c);
    
    // If clicked on an existing cell in the path, rewind path to that cell
    if (existingIndex >= 0) {
      if (existingIndex < zipPath.length - 1) {
        const truncated = zipPath.slice(0, existingIndex + 1);
        setZipPath(truncated);
        setZipMessage(`Rewound to step ${existingIndex + 1}.`);
      }
      return;
    }

    // Cell is not in path yet. Must be adjacent to last cell in path
    const lastCell = zipPath[zipPath.length - 1];
    if (!lastCell) {
      // If path is empty, must click start cell (checkpoint 1)
      if (r === zipPuzzle.startCoord.r && c === zipPuzzle.startCoord.c) {
        setZipPath([{ r, c }]);
        setZipMessage('Connected step 1! Move to neighbor cells.');
      }
      return;
    }

    if (!isOrthogonalNeighbor(lastCell, { r, c })) {
      setZipMessage('Must move to an adjacent neighboring cell (horizontal or vertical)!');
      return;
    }

    // Check if cell is a checkpoint
    const cp = getCheckpoint(r, c);
    if (cp) {
      const expectedCp = getNextRequiredCheckpointNumber(zipPath);
      if (cp.number !== expectedCp) {
        setZipMessage(`Must connect checkpoint ${expectedCp} before checkpoint ${cp.number}!`);
        return;
      }
    }

    // Valid next move!
    const newPath = [...zipPath, { r, c }];
    setZipPath(newPath);

    // Check if puzzle completed
    if (newPath.length === zipPuzzle.totalCells) {
      // Check if all checkpoints visited
      const allCpNumbers = zipPuzzle.checkpoints.map(chk => chk.number);
      const visitedCpNumbers = newPath
        .map(cell => getCheckpoint(cell.r, cell.c)?.number)
        .filter((num): num is number => num !== undefined);

      const allVisitedInOrder = allCpNumbers.every((num, idx) => visitedCpNumbers[idx] === num);
      if (allVisitedInOrder) {
        setZipSolved(true);
        setZipTimerRunning(false);
        setZipMessage('🎉 ZIPPED! You connected all checkpoints and covered 100% of the grid!');
        if (updateStreak) updateStreak();
        if (addXp) addXp(50);
      } else {
        setZipMessage('All cells visited, but check your checkpoint sequence order!');
      }
    } else {
      const nextCp = getNextRequiredCheckpointNumber(newPath);
      if (nextCp <= zipPuzzle.checkpoints.length) {
        setZipMessage(`Heading towards Checkpoint ${nextCp}... (${newPath.length}/${zipPuzzle.totalCells} cells)`);
      } else {
        setZipMessage(`Fill the remaining cells to finish! (${newPath.length}/${zipPuzzle.totalCells} cells)`);
      }
    }
  };

  // Undo last step in ZIP
  const handleZipUndo = () => {
    if (zipPath.length > 1 && !zipSolved) {
      setZipPath(prev => prev.slice(0, prev.length - 1));
      setZipMessage('Undid last step.');
    }
  };

  // Hint in ZIP (shows next step from solution)
  const handleZipHint = () => {
    if (zipSolved) return;
    const currentLen = zipPath.length;
    if (currentLen < zipPuzzle.hamiltonianPath.length) {
      const nextStep = zipPuzzle.hamiltonianPath[currentLen];
      handleZipCellClick(nextStep.r, nextStep.c);
    }
  };

  // ==========================================
  // 3. MINI SUDOKU STATE (4x4 & 6x6)
  // ==========================================
  const [sudokuSize, setSudokuSize] = useState<4 | 6>(4);
  const [sudokuDifficulty, setSudokuDifficulty] = useState<'easy' | 'medium'>('easy');
  const [sudokuPuzzle, setSudokuPuzzle] = useState<SudokuPuzzle>(() => generateMiniSudoku(4, 'easy'));
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>(() => sudokuPuzzle.initialBoard.map(row => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [sudokuTimer, setSudokuTimer] = useState(0);
  const [sudokuTimerRunning, setSudokuTimerRunning] = useState(false);
  const [sudokuSolved, setSudokuSolved] = useState(false);
  const [sudokuMessage, setSudokuMessage] = useState('Fill every row, column, and box with numbers 1 to ' + sudokuSize);

  const startNewSudoku = useCallback((size: 4 | 6 = sudokuSize, diff: 'easy' | 'medium' = sudokuDifficulty) => {
    const p = generateMiniSudoku(size, diff);
    setSudokuPuzzle(p);
    setSudokuBoard(p.initialBoard.map(row => [...row]));
    setSelectedCell(null);
    setSudokuTimer(0);
    setSudokuTimerRunning(true);
    setSudokuSolved(false);
    setSudokuMessage(`Fill every row, column, and box with numbers 1 to ${size}`);
  }, [sudokuSize, sudokuDifficulty]);

  useEffect(() => {
    startNewSudoku(sudokuSize, sudokuDifficulty);
  }, [sudokuSize, sudokuDifficulty]);

  // Sudoku Timer
  useEffect(() => {
    let t: any;
    if (sudokuTimerRunning && !sudokuSolved) {
      t = setInterval(() => setSudokuTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(t);
  }, [sudokuTimerRunning, sudokuSolved]);

  const conflicts = getSudokuConflicts(sudokuBoard, sudokuPuzzle.size, sudokuPuzzle.boxRows, sudokuPuzzle.boxCols);

  // Check if given initial clue
  const isGivenClue = (r: number, c: number) => {
    return sudokuPuzzle.initialBoard[r][c] !== 0;
  };

  // Place number in selected cell
  const handleSudokuInput = (num: number) => {
    if (!selectedCell || sudokuSolved) return;
    const [r, c] = selectedCell;
    if (isGivenClue(r, c)) return;

    const newBoard = sudokuBoard.map(row => [...row]);
    newBoard[r][c] = num;
    setSudokuBoard(newBoard);

    // Check completion
    if (isSudokuComplete(newBoard, sudokuPuzzle.solution)) {
      setSudokuSolved(true);
      setSudokuTimerRunning(false);
      setSudokuMessage('🎉 Magnificent! Mini Sudoku solved perfectly!');
      if (updateStreak) updateStreak();
      if (addXp) addXp(50);
    } else {
      setSudokuMessage(`Digit ${num} placed at row ${r + 1}, col ${c + 1}`);
    }
  };

  // Erase cell
  const handleSudokuErase = () => {
    if (!selectedCell || sudokuSolved) return;
    const [r, c] = selectedCell;
    if (isGivenClue(r, c)) return;

    const newBoard = sudokuBoard.map(row => [...row]);
    newBoard[r][c] = 0;
    setSudokuBoard(newBoard);
  };

  // Hint in Sudoku
  const handleSudokuHint = () => {
    if (sudokuSolved) return;
    for (let r = 0; r < sudokuPuzzle.size; r++) {
      for (let c = 0; c < sudokuPuzzle.size; c++) {
        if (sudokuBoard[r][c] === 0 || sudokuBoard[r][c] !== sudokuPuzzle.solution[r][c]) {
          const newBoard = sudokuBoard.map(row => [...row]);
          newBoard[r][c] = sudokuPuzzle.solution[r][c];
          setSudokuBoard(newBoard);
          setSelectedCell([r, c]);
          setSudokuMessage(`Hint revealed: Digit ${sudokuPuzzle.solution[r][c]} placed!`);
          
          if (isSudokuComplete(newBoard, sudokuPuzzle.solution)) {
            setSudokuSolved(true);
            setSudokuTimerRunning(false);
            setSudokuMessage('🎉 Mini Sudoku solved with hint!');
          }
          return;
        }
      }
    }
  };

  // Keyboard navigation for Sudoku
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'sudoku' || !selectedCell || sudokuSolved) return;
      const [r, c] = selectedCell;

      if (e.key >= '1' && e.key <= String(sudokuPuzzle.size)) {
        handleSudokuInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleSudokuErase();
      } else if (e.key === 'ArrowUp' && r > 0) {
        setSelectedCell([r - 1, c]);
      } else if (e.key === 'ArrowDown' && r < sudokuPuzzle.size - 1) {
        setSelectedCell([r + 1, c]);
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setSelectedCell([r, c - 1]);
      } else if (e.key === 'ArrowRight' && c < sudokuPuzzle.size - 1) {
        setSelectedCell([r, c + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedCell, sudokuSolved, sudokuPuzzle.size, sudokuBoard]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack} 
            className="p-3 sm:p-4 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all cursor-pointer"
            title="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight italic text-orange-100 uppercase">
              Daily Boost
            </h1>
            <p className="text-orange-200/50 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-0.5">
              Cognitive Sharpeners: ZIP • Mini Sudoku • Inner Blaze
            </p>
          </div>
        </div>

        {/* Global Facility Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#2a221f] rounded-2xl border border-[#3f332c] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'zip'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-orange-200/60 hover:text-orange-100 hover:bg-white/5'
            }`}
          >
            <Zap size={14} className="fill-current" />
            <span>ZIP Puzzle</span>
          </button>

          <button
            onClick={() => setActiveTab('sudoku')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sudoku'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-orange-200/60 hover:text-orange-100 hover:bg-white/5'
            }`}
          >
            <Grid3X3 size={14} />
            <span>Mini Sudoku</span>
          </button>

          <button
            onClick={() => setActiveTab('inner-blaze')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inner-blaze'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : 'text-orange-200/60 hover:text-orange-100 hover:bg-white/5'
            }`}
          >
            <Flame size={14} />
            <span>Inner Blaze</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FACILITY 1: ZIP PUZZLE */}
      {/* ========================================================================= */}
      {activeTab === 'zip' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className="bg-[#2a221f]/70 p-5 rounded-3xl border border-[#3f332c] flex items-start gap-3.5 text-xs">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30 shrink-0 mt-0.5">
              <Zap size={18} className="fill-current" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-black uppercase tracking-wider text-orange-200 text-xs flex items-center justify-between">
                <span>ZIP Brain Path Game</span>
                <span className="text-[10px] text-orange-400 font-bold">Spatial & Sequential Focus</span>
              </h3>
              <p className="text-orange-100/90 leading-relaxed">
                <strong>Goal:</strong> Draw a continuous single line starting at <strong>1</strong> that visits checkpoints <strong>2, 3...</strong> in numerical order while covering <strong>100% of every grid tile</strong> without crossing or skipping!
              </p>
              <p className="text-[11px] text-orange-200/60 font-medium">
                <em>Tip:</em> Tap adjacent tiles to extend your line. Tap any earlier point in your path to rewind back.
              </p>
            </div>
          </div>

          {/* Game Canvas Container */}
          <div className="bg-[#2a221f] p-6 sm:p-8 rounded-[3rem] border border-[#3f332c] shadow-2xl space-y-6 flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-md">
              <div className="flex items-center gap-2 bg-[#1a1614] px-4 py-2 rounded-2xl border border-[#3f332c]">
                <Timer size={16} className="text-orange-500" />
                <span className="font-mono font-bold text-orange-100 text-sm">{zipTimer}s</span>
              </div>

              {/* Grid Size Switcher */}
              <div className="flex items-center gap-1 bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c] text-xs font-bold">
                <button
                  onClick={() => setZipSize(4)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    zipSize === 4 ? 'bg-orange-600 text-white shadow' : 'text-orange-200/60 hover:text-white'
                  }`}
                >
                  4×4 (16 tiles)
                </button>
                <button
                  onClick={() => setZipSize(5)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    zipSize === 5 ? 'bg-orange-600 text-white shadow' : 'text-orange-200/60 hover:text-white'
                  }`}
                >
                  5×5 (25 tiles)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZipUndo}
                  disabled={zipPath.length <= 1 || zipSolved}
                  className="p-2.5 bg-[#1a1614] hover:bg-[#3f332c] disabled:opacity-40 text-orange-300 rounded-xl border border-[#3f332c] cursor-pointer transition-all"
                  title="Undo last step"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleZipHint}
                  disabled={zipSolved}
                  className="p-2.5 bg-[#1a1614] hover:bg-[#3f332c] disabled:opacity-40 text-amber-400 rounded-xl border border-[#3f332c] cursor-pointer transition-all"
                  title="Next step hint"
                >
                  <Lightbulb size={16} />
                </button>
                <button
                  onClick={() => startNewZip(zipSize)}
                  className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md cursor-pointer transition-all"
                  title="Generate new puzzle"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Interactive ZIP Grid */}
            <div 
              className="grid gap-2.5 sm:gap-3.5 p-4 sm:p-5 bg-[#1a1614] rounded-3xl border border-[#3f332c] shadow-inner select-none"
              style={{
                gridTemplateColumns: `repeat(${zipPuzzle.cols}, minmax(0, 1fr))`,
                width: zipPuzzle.cols === 4 ? '320px' : '360px',
                height: zipPuzzle.rows === 4 ? '320px' : '360px'
              }}
            >
              {Array.from({ length: zipPuzzle.rows }).map((_, r) =>
                Array.from({ length: zipPuzzle.cols }).map((_, c) => {
                  const cp = getCheckpoint(r, c);
                  const pathIdx = getPathIndex(r, c);
                  const isVisited = pathIdx >= 0;
                  const isHead = isVisited && pathIdx === zipPath.length - 1;
                  const isStart = r === zipPuzzle.startCoord.r && c === zipPuzzle.startCoord.c;

                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleZipCellClick(r, c)}
                      className={`relative rounded-2xl flex items-center justify-center font-black text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-sm border ${
                        isHead
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 border-amber-300 ring-4 ring-orange-500/40 scale-105 z-10'
                          : isVisited
                          ? 'bg-orange-600/30 text-orange-200 border-orange-500/40 hover:bg-orange-600/40'
                          : cp
                          ? 'bg-[#2a221f] text-amber-300 border-amber-500/50 hover:border-amber-400'
                          : 'bg-[#241c19] text-orange-200/20 border-[#3f332c] hover:border-orange-500/30'
                      }`}
                    >
                      {/* Checkpoint Badge or Step Number */}
                      {cp ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-base sm:text-lg font-black tracking-tight ${
                            isHead ? 'text-slate-950' : 'text-amber-300'
                          }`}>
                            {cp.number}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-tighter -mt-1 ${
                            isHead ? 'text-slate-900' : 'text-amber-400/70'
                          }`}>
                            NODE
                          </span>
                        </div>
                      ) : isVisited ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400/80 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/20" />
                      )}

                      {/* Small Order Badge when visited */}
                      {isVisited && (
                        <span className={`absolute bottom-1 right-1 text-[8px] font-mono font-bold ${
                          isHead ? 'text-slate-900' : 'text-orange-300/60'
                        }`}>
                          {pathIdx + 1}
                        </span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Status / Instruction text */}
            <div className={`text-xs font-bold text-center px-4 py-2 rounded-xl transition-all max-w-md ${
              zipSolved 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg' 
                : 'text-orange-200/80 bg-[#1a1614] border border-[#3f332c]'
            }`}>
              {zipMessage}
            </div>

            {/* Progress indicator */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-orange-200/60">
                <span>Coverage</span>
                <span>{zipPath.length} / {zipPuzzle.totalCells} ({Math.round((zipPath.length / zipPuzzle.totalCells) * 100)}%)</span>
              </div>
              <div className="w-full h-2 bg-[#1a1614] rounded-full overflow-hidden border border-[#3f332c]">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${(zipPath.length / zipPuzzle.totalCells) * 100}%` }}
                />
              </div>
            </div>

            {/* Solved Celebration Box */}
            {zipSolved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-amber-400/40 rounded-3xl text-center space-y-3 w-full max-w-md shadow-xl"
              >
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Award size={24} />
                  <span className="text-base font-black uppercase tracking-wider">Hamiltonian Path Cleared!</span>
                </div>
                <p className="text-xs text-orange-100 font-medium">
                  Completed in <strong>{zipTimer} seconds</strong>. Your spatial recall and mental focus are primed!
                </p>
                <button
                  onClick={() => startNewZip(zipSize)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Play Next ZIP Puzzle
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACILITY 2: MINI SUDOKU (4x4 & 6x6) */}
      {/* ========================================================================= */}
      {activeTab === 'sudoku' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className="bg-[#2a221f]/70 p-5 rounded-3xl border border-[#3f332c] flex items-start gap-3.5 text-xs">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30 shrink-0 mt-0.5">
              <Grid3X3 size={18} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-black uppercase tracking-wider text-orange-200 text-xs flex items-center justify-between">
                <span>Randomized Mini Sudoku</span>
                <span className="text-[10px] text-orange-400 font-bold">100% Solvable & Accurate</span>
              </h3>
              <p className="text-orange-100/90 leading-relaxed">
                <strong>Goal:</strong> Fill each empty tile so that every row, every column, and each outlined sub-box contains each digit from <strong>1 to {sudokuPuzzle.size}</strong> exactly once!
              </p>
              <p className="text-[11px] text-orange-200/60 font-medium">
                <em>Controls:</em> Click any tile to select, then click a keypad digit below or press keys 1-{sudokuPuzzle.size} on your keyboard.
              </p>
            </div>
          </div>

          {/* Sudoku Board Canvas */}
          <div className="bg-[#2a221f] p-6 sm:p-8 rounded-[3rem] border border-[#3f332c] shadow-2xl space-y-6 flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-md">
              <div className="flex items-center gap-2 bg-[#1a1614] px-4 py-2 rounded-2xl border border-[#3f332c]">
                <Timer size={16} className="text-orange-500" />
                <span className="font-mono font-bold text-orange-100 text-sm">{sudokuTimer}s</span>
              </div>

              {/* Size Selector */}
              <div className="flex items-center gap-1 bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c] text-xs font-bold">
                <button
                  onClick={() => setSudokuSize(4)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    sudokuSize === 4 ? 'bg-orange-600 text-white shadow' : 'text-orange-200/60 hover:text-white'
                  }`}
                >
                  4×4 Mini
                </button>
                <button
                  onClick={() => setSudokuSize(6)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    sudokuSize === 6 ? 'bg-orange-600 text-white shadow' : 'text-orange-200/60 hover:text-white'
                  }`}
                >
                  6×6 Mini
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSudokuHint}
                  disabled={sudokuSolved}
                  className="p-2.5 bg-[#1a1614] hover:bg-[#3f332c] disabled:opacity-40 text-amber-400 rounded-xl border border-[#3f332c] cursor-pointer transition-all"
                  title="Hint: Fill 1 correct cell"
                >
                  <Lightbulb size={16} />
                </button>
                <button
                  onClick={() => startNewSudoku(sudokuSize, sudokuDifficulty)}
                  className="p-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md cursor-pointer transition-all"
                  title="Generate new puzzle"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Sudoku Grid */}
            <div 
              className="p-4 bg-[#1a1614] rounded-3xl border-2 border-[#3f332c] shadow-inner select-none"
              style={{
                width: sudokuPuzzle.size === 4 ? '300px' : '360px'
              }}
            >
              <div 
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${sudokuPuzzle.size}, minmax(0, 1fr))`
                }}
              >
                {sudokuBoard.map((row, r) =>
                  row.map((val, c) => {
                    const isGiven = isGivenClue(r, c);
                    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                    const isConflict = conflicts[r][c];
                    const selectedVal = selectedCell ? sudokuBoard[selectedCell[0]][selectedCell[1]] : 0;
                    const isSameNumber = val !== 0 && selectedVal !== 0 && val === selectedVal;

                    // Box boundaries borders
                    const isBoxBottom = (r + 1) % sudokuPuzzle.boxRows === 0 && r < sudokuPuzzle.size - 1;
                    const isBoxRight = (c + 1) % sudokuPuzzle.boxCols === 0 && c < sudokuPuzzle.size - 1;

                    return (
                      <motion.button
                        key={`${r}-${c}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCell([r, c])}
                        className={`h-12 sm:h-14 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl transition-all cursor-pointer relative border ${
                          isSelected
                            ? 'bg-amber-500/30 text-amber-300 border-amber-400 ring-2 ring-amber-400/50'
                            : isConflict
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                            : isSameNumber
                            ? 'bg-orange-500/20 text-orange-200 border-orange-500/40'
                            : isGiven
                            ? 'bg-[#2a221f] text-orange-100 border-[#3f332c]'
                            : val !== 0
                            ? 'bg-[#1e1917] text-amber-300 border-amber-500/20'
                            : 'bg-[#241c19] text-transparent border-[#3f332c]/60 hover:border-orange-500/30'
                        } ${isBoxBottom ? 'mb-1.5' : ''} ${isBoxRight ? 'mr-1.5' : ''}`}
                      >
                        <span>{val !== 0 ? val : ''}</span>
                        {isGiven && (
                          <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-orange-500/40" />
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Status Message */}
            <div className={`text-xs font-bold text-center px-4 py-2 rounded-xl transition-all max-w-md ${
              sudokuSolved 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg' 
                : 'text-orange-200/80 bg-[#1a1614] border border-[#3f332c]'
            }`}>
              {sudokuMessage}
            </div>

            {/* Keypad */}
            <div className="flex items-center justify-center gap-2 max-w-md w-full">
              {Array.from({ length: sudokuPuzzle.size }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleSudokuInput(i + 1)}
                  className="flex-1 py-3 bg-[#1a1614] hover:bg-orange-600 hover:text-white border border-[#3f332c] text-orange-100 font-black text-base sm:text-lg rounded-2xl shadow transition-all active:scale-95 cursor-pointer"
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={handleSudokuErase}
                className="px-4 py-3 bg-[#1a1614] hover:bg-rose-600/30 text-rose-300 border border-[#3f332c] font-black text-xs uppercase tracking-wider rounded-2xl shadow transition-all active:scale-95 cursor-pointer"
                title="Erase cell"
              >
                Erase
              </button>
            </div>

            {/* Solved celebration box */}
            {sudokuSolved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-amber-400/40 rounded-3xl text-center space-y-3 w-full max-w-md shadow-xl"
              >
                <div className="flex items-center justify-center gap-2 text-amber-300">
                  <Trophy size={24} />
                  <span className="text-base font-black uppercase tracking-wider">Mini Sudoku Mastered!</span>
                </div>
                <p className="text-xs text-orange-100 font-medium">
                  Solved in <strong>{sudokuTimer} seconds</strong>. Excellent logic and working memory discipline!
                </p>
                <button
                  onClick={() => startNewSudoku(sudokuSize, sudokuDifficulty)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Generate Next Sudoku
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACILITY 3: INNER BLAZE (Flash Digit Recall) */}
      {/* ========================================================================= */}
      {activeTab === 'inner-blaze' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className="bg-[#2a221f]/70 p-5 rounded-3xl border border-[#3f332c] flex items-start gap-3.5 text-xs">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30 shrink-0 mt-0.5">
              <Flame size={18} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-black uppercase tracking-wider text-orange-200 text-xs flex items-center justify-between">
                <span>Inner Blaze Reflex Recall</span>
                <span className="text-[10px] text-orange-400 font-bold">30-Second Working Memory Sprint</span>
              </h3>
              <p className="text-orange-100/90 leading-relaxed">
                <strong>Goal:</strong> Pay intense attention to the vanished sequence of digits, then key it back in from short-term memory before the timer ticks down!
              </p>
            </div>
          </div>

          <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-[#3f332c] min-h-[480px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {blazeState === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8 flex flex-col items-center relative z-10 max-w-sm"
                >
                  <div className="p-6 bg-orange-600/20 rounded-full border border-orange-500/30 text-orange-400">
                    <Brain size={60} />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-orange-100 italic uppercase tracking-tight">
                      Ignite Your Recall?
                    </h2>
                    <p className="text-orange-200/50 mt-2 text-xs font-bold uppercase tracking-wider leading-relaxed">
                      Capture the vanishing numbers. Speed up your cognitive reflexes before deep study.
                    </p>
                  </div>
                  <button 
                    onClick={startBlazeGame}
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:from-orange-700 hover:to-amber-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                  >
                    <Zap size={20} className="fill-white" />
                    <span>Start 30s Blaze</span>
                  </button>
                </motion.div>
              )}

              {blazeState === 'playing' && (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full space-y-12 relative z-10 max-w-md"
                >
                  <div className="flex justify-between items-center w-full p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] shadow-inner">
                    <div className="flex items-center gap-3 font-black text-orange-200/40">
                      <Timer size={20} className="text-orange-500" />
                      <span className="text-xl tabular-nums italic font-black text-orange-100">{blazeTimeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-3 font-black text-orange-500">
                      <span className="text-xl tabular-nums italic font-black">{blazeScore} pts</span>
                      <Trophy size={20} className="text-amber-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center min-h-[180px]">
                    {showNumber ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="text-6xl sm:text-7xl font-black tracking-[0.25em] text-orange-100 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)] italic"
                      >
                        {targetNumber}
                      </motion.div>
                    ) : (
                      <div className="space-y-6 w-full max-w-[280px]">
                        <input 
                          type="number"
                          autoFocus
                          value={blazeInput}
                          onChange={e => setBlazeInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && checkBlazeNumber()}
                          className="text-5xl font-black text-center w-full bg-transparent border-b-4 border-orange-600 outline-none pb-4 tracking-[0.2em] text-orange-100 italic drop-shadow-xl"
                          placeholder="----"
                        />
                        <button 
                          onClick={checkBlazeNumber}
                          className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl hover:bg-orange-700 transition-all active:scale-95 cursor-pointer"
                        >
                          Submit Number
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {blazeState === 'result' && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 flex flex-col items-center relative z-10 max-w-sm"
                >
                  <div className="p-6 bg-orange-600/20 rounded-full border border-orange-500/30 text-amber-400">
                    <Trophy size={60} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-orange-100 italic uppercase">Radiant Mind!</h2>
                    <p className="text-orange-200/50 mt-1 font-bold uppercase tracking-wider text-[10px]">
                      Your working memory is fully activated.
                    </p>
                    <div className="mt-6 bg-[#1a1614] px-8 py-3 rounded-2xl border border-[#3f332c] inline-block">
                      <span className="text-[10px] uppercase font-black tracking-widest text-orange-200/50 block">Score</span>
                      <span className="text-3xl font-black text-orange-500 italic">{blazeScore}</span>
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => setBlazeState('idle')}
                      className="w-full px-6 py-3.5 bg-[#1a1614] rounded-2xl font-black uppercase italic tracking-wider text-xs flex items-center justify-center gap-2 border border-[#3f332c] text-orange-200/70 hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw size={16} />
                      Play Again
                    </button>
                    <button 
                      onClick={goBack}
                      className="w-full px-6 py-3.5 bg-orange-600 text-white rounded-2xl font-black uppercase italic tracking-wider text-xs shadow-xl hover:bg-orange-700 transition-all active:scale-95 cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
