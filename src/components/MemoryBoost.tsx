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
  generateZipPuzzle, 
  isOrthogonalNeighbor, 
  ZipPuzzle, 
  ZipCellCoord 
} from '../utils/zipGenerator';

type DailyBoostTab = 'zip' | 'number-recall';
type BlazeState = 'idle' | 'playing' | 'result';

export const MemoryBoost: React.FC = () => {
  const { goBack, updateStreak, addXp, theme } = useAppContext();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<DailyBoostTab>('zip');

  // ZIP drag tracing without lifting mouse / touch
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = React.useRef(false);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

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

  // Clean up global drag listeners on unmount
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('touchcancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('touchcancel', handleGlobalPointerUp);
    };
  }, []);

  // Handle cell click / drag interaction in ZIP (without lifting mouse or finger)
  const handleZipCellInteraction = useCallback((r: number, c: number, isInitialPress: boolean = false) => {
    if (zipSolved) return;

    setZipPath(prevPath => {
      const existingIndex = prevPath.findIndex(p => p.r === r && p.c === c);

      // 1. If path is empty, must start on checkpoint 1 / startCoord
      if (prevPath.length === 0) {
        if (r === zipPuzzle.startCoord.r && c === zipPuzzle.startCoord.c) {
          setZipMessage('Connected step 1! Drag to neighboring cells without lifting your mouse.');
          return [{ r, c }];
        }
        return prevPath;
      }

      const lastCell = prevPath[prevPath.length - 1];

      // 2. Already on current head
      if (lastCell.r === r && lastCell.c === c) {
        return prevPath;
      }

      // 3. User dragging backwards to previous step (backtracking without lifting mouse)
      if (prevPath.length > 1 && prevPath[prevPath.length - 2].r === r && prevPath[prevPath.length - 2].c === c) {
        const truncated = prevPath.slice(0, prevPath.length - 1);
        setZipMessage(`Backtracked to step ${truncated.length}.`);
        return truncated;
      }

      // 4. If already in path at an earlier position, rewind path to that cell
      if (existingIndex >= 0) {
        if (existingIndex < prevPath.length - 1) {
          const truncated = prevPath.slice(0, existingIndex + 1);
          setZipMessage(`Rewound to step ${existingIndex + 1}.`);
          return truncated;
        }
        return prevPath;
      }

      // 5. Must be an orthogonal neighbor (horizontal or vertical) to the current head
      if (!isOrthogonalNeighbor(lastCell, { r, c })) {
        if (isInitialPress) {
          setZipMessage('Must connect to an adjacent cell (up, down, left, right)!');
        }
        return prevPath;
      }

      // 6. Checkpoint sequencing constraint: must connect in numerical order
      const cp = getCheckpoint(r, c);
      if (cp) {
        const expectedCp = getNextRequiredCheckpointNumber(prevPath);
        if (cp.number !== expectedCp) {
          setZipMessage(`Must connect checkpoint ${expectedCp} before checkpoint ${cp.number}!`);
          return prevPath;
        }
      }

      // 7. Valid continuous next step!
      const newPath = [...prevPath, { r, c }];

      // Check if puzzle completed
      if (newPath.length === zipPuzzle.totalCells) {
        const allCpNumbers = zipPuzzle.checkpoints.map(chk => chk.number);
        const visitedCpNumbers = newPath
          .map(cell => getCheckpoint(cell.r, cell.c)?.number)
          .filter((num): num is number => num !== undefined);

        const allVisitedInOrder = allCpNumbers.every((num, idx) => visitedCpNumbers[idx] === num);
        if (allVisitedInOrder) {
          setZipSolved(true);
          setZipTimerRunning(false);
          setZipMessage('🎉 ZIPPED! You connected all checkpoints and covered 100% of the grid without lifting mouse!');
          if (updateStreak) updateStreak();
          if (addXp) addXp(50);
        } else {
          setZipMessage('All cells visited, but check your checkpoint sequence order!');
        }
      } else {
        const nextCp = getNextRequiredCheckpointNumber(newPath);
        if (nextCp <= zipPuzzle.checkpoints.length) {
          setZipMessage(`Drag towards Checkpoint ${nextCp}... (${newPath.length}/${zipPuzzle.totalCells} cells)`);
        } else {
          setZipMessage(`Cover all remaining cells to finish! (${newPath.length}/${zipPuzzle.totalCells} cells)`);
        }
      }

      return newPath;
    });
  }, [zipSolved, zipPuzzle, updateStreak, addXp]);

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (zipSolved) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    handleZipCellInteraction(r, c, true);
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (zipSolved) return;
    if (isDraggingRef.current) {
      handleZipCellInteraction(r, c, false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zipSolved || !isDraggingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    const cellCoord = target.getAttribute('data-cell-coord') || target.closest('[data-cell-coord]')?.getAttribute('data-cell-coord');
    if (cellCoord) {
      const [rStr, cStr] = cellCoord.split('-');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (!isNaN(r) && !isNaN(c)) {
        handleZipCellInteraction(r, c, false);
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
      handleZipCellInteraction(nextStep.r, nextStep.c, true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack} 
            className={`p-3 sm:p-4 rounded-2xl shadow-sm border transition-all cursor-pointer ${
              isLight ? 'bg-white border-orange-200 text-stone-800 hover:text-orange-600' : 'bg-[#2a221f] border-[#3f332c] text-orange-200 hover:text-orange-500'
            }`}
            title="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight italic uppercase ${
              isLight ? 'text-stone-900' : 'text-orange-100'
            }`}>
              Daily Boost
            </h1>
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-0.5 ${
              isLight ? 'text-stone-600' : 'text-orange-200/50'
            }`}>
              Cognitive Sharpeners: ZIP Puzzle • Number Recall
            </p>
          </div>
        </div>

        {/* Global Facility Switcher Pills */}
        <div className={`flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl border w-full sm:w-auto transition-colors ${
          isLight ? 'bg-orange-100/70 border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'zip'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-white/60' : 'text-orange-200/60 hover:text-orange-100 hover:bg-white/5'
            }`}
          >
            <Zap size={14} className="fill-current" />
            <span>ZIP Puzzle</span>
          </button>

          <button
            onClick={() => setActiveTab('number-recall')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'number-recall'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                : isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-white/60' : 'text-orange-200/60 hover:text-orange-100 hover:bg-white/5'
            }`}
          >
            <Flame size={14} />
            <span>Number Recall</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FACILITY 1: ZIP PUZZLE */}
      {/* ========================================================================= */}
      {activeTab === 'zip' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className={`p-5 rounded-3xl border flex items-start gap-3.5 text-xs transition-colors ${
            isLight ? 'bg-orange-50 border-orange-200 text-stone-800 shadow-sm' : 'bg-[#2a221f]/70 border-[#3f332c] text-orange-100/90'
          }`}>
            <div className="p-2 bg-orange-600/20 text-orange-500 rounded-xl border border-orange-500/30 shrink-0 mt-0.5">
              <Zap size={18} className="fill-current" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-black uppercase tracking-wider text-xs flex items-center justify-between">
                <span className={isLight ? 'text-stone-900 font-black' : 'text-orange-200'}>ZIP Continuous Number Connector</span>
                <span className="text-[10px] text-orange-500 font-bold">Trace Without Lifting Mouse</span>
              </h3>
              <p className={isLight ? 'text-stone-700 leading-relaxed' : 'text-orange-100/90 leading-relaxed'}>
                <strong>How to play:</strong> Click and drag your mouse (or drag your finger on phone/tablet) starting from <strong>1</strong> to connect <strong>2, 3...</strong> in numerical order without lifting your cursor, covering <strong>100% of the grid</strong>!
              </p>
              <p className={isLight ? 'text-[11px] text-stone-600 font-medium' : 'text-[11px] text-orange-200/60 font-medium'}>
                <em>Intuitive Dragging:</em> Drag backwards into an earlier cell to erase or backtrack your path smoothly at any time.
              </p>
            </div>
          </div>

          {/* Game Canvas Container */}
          <div className={`p-6 sm:p-8 rounded-[3rem] border shadow-2xl space-y-6 flex flex-col items-center transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-md">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                isLight ? 'bg-orange-50/80 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
              }`}>
                <Timer size={16} className="text-orange-500" />
                <span className="font-mono font-bold text-sm">{zipTimer}s</span>
              </div>

              {/* Grid Size Switcher */}
              <div className={`flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold ${
                isLight ? 'bg-orange-50/80 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
              }`}>
                <button
                  onClick={() => setZipSize(4)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    zipSize === 4 
                      ? 'bg-orange-600 text-white shadow' 
                      : isLight ? 'text-stone-600 hover:text-stone-950' : 'text-orange-200/60 hover:text-white'
                  }`}
                >
                  4×4 (16 tiles)
                </button>
                <button
                  onClick={() => setZipSize(5)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    zipSize === 5 
                      ? 'bg-orange-600 text-white shadow' 
                      : isLight ? 'text-stone-600 hover:text-stone-950' : 'text-orange-200/60 hover:text-white'
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
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all disabled:opacity-40 ${
                    isLight 
                      ? 'bg-orange-50 hover:bg-orange-100 text-stone-800 border-orange-200' 
                      : 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-300 border-[#3f332c]'
                  }`}
                  title="Undo last step"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleZipHint}
                  disabled={zipSolved}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all disabled:opacity-40 ${
                    isLight 
                      ? 'bg-orange-50 hover:bg-orange-100 text-amber-700 border-orange-200' 
                      : 'bg-[#1a1614] hover:bg-[#3f332c] text-amber-400 border-[#3f332c]'
                  }`}
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

            {/* Interactive ZIP Grid with continuous SVG connector path & touch tracing */}
            <div 
              ref={gridContainerRef}
              onTouchMove={handleTouchMove}
              className={`relative grid gap-2.5 sm:gap-3.5 p-4 sm:p-5 rounded-3xl border shadow-inner select-none transition-colors ${
                isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
              }`}
              style={{
                gridTemplateColumns: `repeat(${zipPuzzle.cols}, minmax(0, 1fr))`,
                width: zipPuzzle.cols === 4 ? '320px' : '360px',
                height: zipPuzzle.rows === 4 ? '320px' : '360px',
                touchAction: 'none'
              }}
            >
              {/* Dynamic SVG connecting line overlay tracing the active path */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ overflow: 'visible' }}
              >
                {zipPath.map((cell, idx) => {
                  if (idx === zipPath.length - 1) return null;
                  const nextCell = zipPath[idx + 1];
                  const x1 = ((cell.c + 0.5) / zipPuzzle.cols) * 100;
                  const y1 = ((cell.r + 0.5) / zipPuzzle.rows) * 100;
                  const x2 = ((nextCell.c + 0.5) / zipPuzzle.cols) * 100;
                  const y2 = ((nextCell.r + 0.5) / zipPuzzle.rows) * 100;
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#f97316"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.85"
                      className="transition-all duration-150"
                    />
                  );
                })}
              </svg>

              {Array.from({ length: zipPuzzle.rows }).map((_, r) =>
                Array.from({ length: zipPuzzle.cols }).map((_, c) => {
                  const cp = getCheckpoint(r, c);
                  const pathIdx = getPathIndex(r, c);
                  const isVisited = pathIdx >= 0;
                  const isHead = isVisited && pathIdx === zipPath.length - 1;

                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      data-cell-coord={`${r}-${c}`}
                      onPointerDown={(e) => handlePointerDown(r, c, e)}
                      onPointerEnter={() => handlePointerEnter(r, c)}
                      className={`relative rounded-2xl flex items-center justify-center font-black text-sm sm:text-base transition-all duration-150 cursor-pointer shadow-sm border select-none ${
                        isHead
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 border-amber-300 ring-4 ring-orange-500/40 scale-105 z-20'
                          : isVisited
                          ? isLight 
                            ? 'bg-orange-200/90 text-orange-950 border-orange-400 z-10' 
                            : 'bg-orange-600/40 text-orange-100 border-orange-500/50 z-10'
                          : cp
                          ? isLight
                            ? 'bg-amber-100/90 text-amber-900 border-amber-400 hover:border-amber-500 z-10'
                            : 'bg-[#2a221f] text-amber-300 border-amber-500/50 hover:border-amber-400 z-10'
                          : isLight
                          ? 'bg-white text-stone-400 border-orange-100 hover:border-orange-300'
                          : 'bg-[#241c19] text-orange-200/20 border-[#3f332c] hover:border-orange-500/30'
                      }`}
                    >
                      {/* Checkpoint Badge or Step Indicator */}
                      {cp ? (
                        <div className="flex flex-col items-center pointer-events-none">
                          <span className={`text-base sm:text-lg font-black tracking-tight ${
                            isHead 
                              ? 'text-slate-950' 
                              : isLight ? 'text-amber-950' : 'text-amber-300'
                          }`}>
                            {cp.number}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-tighter -mt-1 ${
                            isHead 
                              ? 'text-slate-900' 
                              : isLight ? 'text-amber-800' : 'text-amber-400/80'
                          }`}>
                            NODE
                          </span>
                        </div>
                      ) : isVisited ? (
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.9)] pointer-events-none" />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full pointer-events-none ${
                          isLight ? 'bg-orange-300' : 'bg-orange-500/20'
                        }`} />
                      )}

                      {/* Small Order Step Badge when visited */}
                      {isVisited && (
                        <span className={`absolute bottom-1 right-1 text-[8px] font-mono font-bold pointer-events-none ${
                          isHead ? 'text-slate-900' : isLight ? 'text-stone-800' : 'text-orange-300/70'
                        }`}>
                          {pathIdx + 1}
                        </span>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Status / Instruction text */}
            <div className={`text-xs font-bold text-center px-4 py-2.5 rounded-xl transition-all max-w-md ${
              zipSolved 
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-lg' 
                : isLight
                ? 'text-stone-800 bg-orange-50 border border-orange-200'
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
      {/* FACILITY 2: NUMBER RECALL (Flash Digit Recall) */}
      {/* ========================================================================= */}
      {activeTab === 'number-recall' && (
        <div className="space-y-6">
          {/* Guide Banner */}
          <div className={`p-5 rounded-3xl border flex items-start gap-3.5 text-xs transition-colors ${
            isLight ? 'bg-orange-50 border-orange-200 text-stone-800 shadow-sm' : 'bg-[#2a221f]/70 border-[#3f332c] text-orange-100/90'
          }`}>
            <div className="p-2 bg-orange-600/20 text-orange-500 rounded-xl border border-orange-500/30 shrink-0 mt-0.5">
              <Flame size={18} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-black uppercase tracking-wider text-xs flex items-center justify-between">
                <span className={isLight ? 'text-stone-900 font-black' : 'text-orange-200'}>Number Recall Sprint</span>
                <span className="text-[10px] text-orange-500 font-bold">30-Second Working Memory Sprint</span>
              </h3>
              <p className={isLight ? 'text-stone-700 leading-relaxed' : 'text-orange-100/90 leading-relaxed'}>
                <strong>Goal:</strong> Pay intense attention to the vanished sequence of digits, then key it back in from short-term memory before the timer ticks down!
              </p>
            </div>
          </div>

          <div className={`p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border min-h-[480px] flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
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
                    <h2 className={`text-2xl sm:text-3xl font-black italic uppercase tracking-tight ${
                      isLight ? 'text-stone-900' : 'text-orange-100'
                    }`}>
                      Ignite Your Recall
                    </h2>
                    <p className={`mt-2 text-xs font-bold uppercase tracking-wider leading-relaxed ${
                      isLight ? 'text-stone-600' : 'text-orange-200/50'
                    }`}>
                      Capture the vanishing numbers. Speed up your cognitive reflexes before deep study.
                    </p>
                  </div>
                  <button 
                    onClick={startBlazeGame}
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:from-orange-700 hover:to-amber-700 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl cursor-pointer"
                  >
                    <Zap size={20} className="fill-white" />
                    <span>Start 30s Number Recall</span>
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
                  <div className={`flex justify-between items-center w-full p-4 rounded-2xl border shadow-inner ${
                    isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}>
                    <div className="flex items-center gap-3 font-black">
                      <Timer size={20} className="text-orange-500" />
                      <span className={`text-xl tabular-nums italic font-black ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>{blazeTimeLeft}s</span>
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
                        className={`text-6xl sm:text-7xl font-black tracking-[0.25em] italic ${
                          isLight 
                            ? 'text-orange-600 drop-shadow-[0_4px_12px_rgba(234,88,12,0.3)]' 
                            : 'text-orange-100 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)]'
                        }`}
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
                          className={`text-5xl font-black text-center w-full bg-transparent border-b-4 border-orange-600 outline-none pb-4 tracking-[0.2em] italic drop-shadow-sm ${
                            isLight ? 'text-stone-900' : 'text-orange-100'
                          }`}
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
                  <div className="p-6 bg-orange-600/20 rounded-full border border-orange-500/30 text-amber-500">
                    <Trophy size={60} />
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black italic uppercase ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>Radiant Mind!</h2>
                    <p className={`mt-1 font-bold uppercase tracking-wider text-[10px] ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>
                      Your working memory is fully activated.
                    </p>
                    <div className={`mt-6 px-8 py-3 rounded-2xl border inline-block ${
                      isLight ? 'bg-orange-50 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
                    }`}>
                      <span className={`text-[10px] uppercase font-black tracking-widest block ${
                        isLight ? 'text-stone-500' : 'text-orange-200/50'
                      }`}>Score</span>
                      <span className="text-3xl font-black text-orange-500 italic">{blazeScore}</span>
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => setBlazeState('idle')}
                      className={`w-full px-6 py-3.5 rounded-2xl font-black uppercase italic tracking-wider text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        isLight 
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200' 
                          : 'bg-[#1a1614] text-orange-200/70 hover:text-white border-[#3f332c]'
                      }`}
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
