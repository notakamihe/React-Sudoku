import { CSSProperties, useEffect, useMemo, useState } from "react";
import SudokuPuzzle, { PuzzleDifficulty } from "../SudokuPuzzle";
import { faPause, faPlay, faXmark, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SudokuCell from "./SudokuCell";
import Timer from "./Timer";

const style: Record<string, CSSProperties> = {
  boardContainer: {
    width: "fit-content", 
    borderWidth: "0 1px 1px 0", 
    userSelect: "none", 
    position: "relative"
  },
  btn: { backgroundColor: "#fff", fontWeight: "bold", border: "none", borderRadius: 5, padding: 8 },
  cellControl: {
    position: "absolute", 
    top: 0, 
    bottom: 0, 
    display: "flex", 
    flexDirection: "column",
    width: 40, 
    right: -24, 
    transform: "translate(100%, 0)", 
    border: "1px solid #0003", 
    borderRadius: 5
  },
  cellControlBtn: {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    width: "100%", 
    flex: 1, 
    cursor: "pointer"
  },
  difficultyButtonsContainer: {
    display: "flex", 
    marginBottom: 32, 
    border: "1px solid #00f",
    borderRadius: 15
  },
  gameEndOverlay: {
    position: "absolute", 
    inset: 0, 
    display: "flex",
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 15
  },
  lives: { flex: 1, margin: 0, color: "#000a", fontSize: 18, fontWeight: "500" },
  pauseToggleBtn: { backgroundColor: "#0000", border: "none", marginRight: 8, marginTop: 1, width: 22 },
  revealCellBtn: { borderRadius: "5px 0 0 5px" },
  reveals: { padding: 8, border: "1px solid #00f", borderRadius: "0 5px 5px 0", borderLeft: "none" },
  timerContainer: { margin: "16px auto", display: "flex", justifyContent: "center", alignItems: "center" }
}

const Sudoku = () => {
  const [board, setBoard] = useState<SudokuPuzzle>();
  const [difficulty, setDifficulty] = useState(PuzzleDifficulty.MEDIUM);
  const [initial, setInitial] = useState<number[][]>([]);
  
  const [lives, setLives] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const [reveals, setReveals] = useState(4);
  const [selectedCell, setSelectedCell] = useState<[number, number]>([-1, -1]);
  
  const gameOver = lives <= 0;
  const win = !!board?.isSolved();

  const errorCells = useMemo(() => {
    const rows: number[] = [];
    const cols: number[] = [];
    const subgrids: number[] = [];

    if (board) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {         
          const subRow = Math.floor(i / 3) * 3;
          const subCol = Math.floor(j / 3) * 3;

          for (let k = 0; k < 9; k++) {
            if (k !== j && board.grid[i][k] === board.grid[i][j])
              if (board!.grid[i][k] !== 0 && !rows.includes(i))
                rows.push(i);

            if (k !== i && board.grid[k][j] === board.grid[i][j])
              if (board!.grid[k][j] !== 0 && !cols.includes(j))
                cols.push(j);

            const row = subRow + Math.floor(k / 3);
            const col = subCol + k % 3;

            if ((row !== i || col !== j) && board.grid[row][col] === board.grid[i][j]) {
              const s = Math.floor(j / 3) + 3 * Math.floor(i / 3);
              
              if (board!.grid[row][col] !== 0 && !subgrids.includes(s))
                subgrids.push(s);
            }
          }
        }
      }
    }

    return {rows, cols, subgrids};
  }, [board])

  useEffect(() => {
    generatePuzzle(difficulty);
  }, [difficulty])

  useEffect(() => {
    if (gameOver || win)
      setSelectedCell([-1, -1]);
  }, [gameOver, win])

  useEffect(() => {
    if (resetTimer)
      setResetTimer(false);
  }, [resetTimer])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gameOver && !win && !paused) {
        const [row, col] = selectedCell;
  
        let newRow = row;
        let newCol = col;
  
        if (e.code === "ArrowUp")
          newRow = Math.max(0, row - 1);
        if (e.code === "ArrowDown")
          newRow = Math.min(8, row + 1);
        if (e.code === "ArrowLeft")
          newCol = Math.max(0, col - 1);
        if (e.code === "ArrowRight")
          newCol = Math.min(8, col + 1);
  
        if (newRow !== row || newCol !== col) {
          setSelectedCell(row === -1 || col === -1 ? [0, 0] : [newRow, newCol])
        } else if (row > -1 && col > -1) {
          if (!board!.isCellSolved(row, col)) {
            const num = parseInt(e.key);
            
            if (!isNaN(num) && num !== 0)
              fillCell(row, col, num);
            else if (e.code === "Backspace")
              clearCell(row, col);
          }
        }
      }
    }

    function onClick(e: MouseEvent) {
      setSelectedCell([-1, -1]);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener("click", onClick);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [selectedCell, lives]);

  const clearCell = (row: number, col: number) => {
    board!.grid[row][col] = 0;
    setBoard(board!.copy());
  }

  const fillCell = (row: number, col: number, value: number) => {
    board!.grid[row][col] = value;

    setBoard(board!.copy());

    if (!board!.isCellSolved(row, col))
      setLives(lives - 1);
  }

  const getDifficultyButtonStyle = (diff: PuzzleDifficulty) => ({
    flex: 1,
    fontSize: 18, 
    border: "none",
    backgroundColor: difficulty === diff ? "#00f" : "#0000",
    color: difficulty === diff ? "#fff" : "#00f",
    fontWeight: "bold",
    padding: 4,
    cursor: "pointer"
  })

  const generatePuzzle = (difficulty: PuzzleDifficulty) => {
    const puzzle = SudokuPuzzle.generatePuzzle(difficulty);

    setBoard(puzzle);
    setInitial(puzzle.grid.map(row => row.slice()));
    resetGame();
  }

  const onCellClick = (row: number, col: number) => {
    if (!board!.isCellSolved(row, col))
      setSelectedCell([row, col]);
  }

  const onCellControlBtnClick = (e: React.MouseEvent, num: number) => {
    e.stopPropagation();

    const [row, col] = selectedCell;

    if (row > -1 && col > -1) {
      if (initial[row][col] !== board!.complete[row][col] && !board!.isCellSolved(row, col)) {
        if (num > 0)
          fillCell(row, col, num);
        else
          clearCell(row, col);
      }
    }
  }

  const resetGame = () => {
    setLives(5);
    setSelectedCell([-1, -1]);
    setResetTimer(true);
    setPaused(false);
    setReveals(4);
  }

  const restart = () => {
    board!.grid = initial.map(row => row.slice());
    setBoard(board!.copy());
    resetGame();
  }

  const revealCell = (e: React.MouseEvent) => {
    e.stopPropagation();

    const [row, col] = selectedCell;

    if (reveals > 0 && row > -1 && col > -1) {
      if (initial[row][col] !== board!.complete[row][col] && !board!.isCellSolved(row, col)) {
        board!.grid[row][col] = board!.complete[row][col];
        setBoard(board!.copy());
        setReveals(reveals - 1);
      }
    }
  }

  const togglePause = () => {
    if (!gameOver && !win)
      setPaused(!paused);
  }

  return (
    <div>
      <div style={style.difficultyButtonsContainer}>
        <button
          onClick={() => setDifficulty(PuzzleDifficulty.EASY)}
          style={{borderRadius: "15px 0 0 15px", ...getDifficultyButtonStyle(PuzzleDifficulty.EASY)}}
        >
          EASY
        </button>
        <button
          onClick={() => setDifficulty(PuzzleDifficulty.MEDIUM)}
          style={getDifficultyButtonStyle(PuzzleDifficulty.MEDIUM)}
        >
          MEDIUM
        </button>
        <button
          onClick={() => setDifficulty(PuzzleDifficulty.HARD)}
          style={getDifficultyButtonStyle(PuzzleDifficulty.HARD)}
        >
          HARD
        </button>
        <button
          onClick={() => setDifficulty(PuzzleDifficulty.EVIL)}
          style={{borderRadius: "0 15px 15px 0", ...getDifficultyButtonStyle(PuzzleDifficulty.EVIL)}}
        >
          EVIL
        </button>
      </div>
      <div style={style.boardContainer}>
        {board && (
          <>
            <div 
              style={{
                pointerEvents: gameOver || win || paused ? "none" : "auto", 
                opacity: gameOver || win ? 0.05 : 1
              }}
            >
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ display: "flex", marginBottom: i === 2 || i === 5 ? 16 : 0 }}>
                  {Array.from({ length: 9 }, (_, j) => (
                    <SudokuCell
                      board={board}
                      editable={initial[i][j] !== board.complete[i][j]}
                      error={
                        errorCells.rows.includes(i) || 
                        errorCells.cols.includes(j) ||
                        errorCells.subgrids.includes(Math.floor(j / 3) + 3 * Math.floor(i / 3))
                      }
                      key={j}
                      onClick={onCellClick}
                      position={[i, j]}
                      selected={i === selectedCell[0] && j === selectedCell[1]}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div
              style={{
                ...style.cellControl, 
                pointerEvents: gameOver || win || paused ? "none" : "auto", 
                opacity: gameOver || win ? 0.4 : 1
              }}
            >
              {Array.from({ length: 9 }, (_, i) => {
                const solved = board.isNumberSolved(i + 1);

                return (
                  <div 
                    className={`hbtn-secondary`}
                    key={i} 
                    onClick={e => onCellControlBtnClick(e, i + 1)} 
                    style={{
                      ...style.cellControlBtn, 
                      borderBottom: "1px solid #0003",
                      pointerEvents: solved ? "none" : "inherit"
                    }}
                  >
                    <span style={{fontSize: 24, opacity: solved && !gameOver && !win ? 0.4 : 1}}>
                      {i + 1}
                    </span>
                  </div>
                )
              })}
              <div 
                className="hbtn-secondary" 
                onClick={e => onCellControlBtnClick(e, 0)}
                style={style.cellControlBtn}
              >
                <FontAwesomeIcon icon={faXmark} style={{fontSize: 20}} />
              </div>
            </div>
            {(gameOver || win) && (
              <div 
                style={{
                  ...style.gameEndOverlay,
                  backgroundColor: gameOver ? "#ee000050" : "#00990060"
                }}
              >
                <p style={{color: "#000b", fontWeight: "bold"}}>
                  {win ? "Congratulations! You solved the puzzle." : "Game over!"}
                </p>
                <div>
                  {gameOver && (
                    <button onClick={restart} style={{...style.btn, marginRight: 8}}>
                      Restart
                    </button>
                  )}
                  <button onClick={() => generatePuzzle(difficulty)} style={style.btn}>
                    New Game
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div style={style.timerContainer}>
        <button onClick={togglePause} style={style.pauseToggleBtn}>        
          <FontAwesomeIcon icon={paused ? faPlay : faPause} style={{fontSize: 20}} />
        </button>
        <Timer paused={gameOver || win || paused} reset={resetTimer} />
      </div>
      <div style={{display: "flex", alignItems: "center"}}>
        <p style={style.lives}>
          Lives: {lives}
        </p>
        <div className={reveals <= 0 ? "disabled" : ""} style={{ display: "flex", marginRight: 12 }}>
          <button className="hbtn-primary btn-outlined" onClick={revealCell} style={style.revealCellBtn}>
            Reveal cell
          </button>
          <div style={style.reveals}>
            <span style={{color: "#00f"}}>{reveals}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => generatePuzzle(difficulty)} style={{marginRight: 12}}>
          New game
        </button>
        <button className="btn-outlined" onClick={restart} style={{borderRadius: 15}}>
          <FontAwesomeIcon icon={faRotateRight} style={{fontSize: 18}} />
        </button>
      </div>
    </div>
  )
}

export default Sudoku;