import { CSSProperties } from "react";
import SudokuPuzzle from "../SudokuPuzzle";

interface SudokuCellProps {
  board: SudokuPuzzle;
  editable: boolean;
  error: boolean;
  onClick: (row: number, col: number) => void;
  position: [number, number];
  selected: boolean;
}

const SudokuCell = ({ board, editable, error, position, onClick, selected }: SudokuCellProps) => {
  const [row, col] = position;

  const getStyle = (): CSSProperties => {
    const cell = board!.grid[row][col];
    const value = board!.complete[row][col];

    const correct = cell !== 0 && editable && cell === value;
    const incorrect = (cell !== 0 && editable && cell !== value);

    return {
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      position: "relative",
      width: 40, 
      height: 40, 
      border: "1px solid #0003",
      cursor: cell !== value ? "pointer" : "default",
      marginRight: col === 2 || col === 5 ? 16 : 0,
      borderBottomWidth: (row + 1) % 3 !== 0 ? 0 : 1,
      borderRightWidth: (col + 1) % 3 !== 0 ? 0 : 1,
      borderTopLeftRadius: row % 3 === 0 && col % 3 === 0 ? 10 : 0,
      borderTopRightRadius: row % 3 === 0 && (col + 1) % 3 === 0 ? 10 : 0,
      borderBottomLeftRadius: (row + 1) % 3 === 0 && col % 3 === 0 ? 10 : 0,
      borderBottomRightRadius: (row + 1) % 3 === 0 && (col + 1) % 3 === 0 ? 10 : 0,
      color: correct ? "#0b0" : incorrect ? "#f00" : "",
      backgroundColor: selected ? correct ? "#0b03" : incorrect ? "#f003" : "#eee": "#0000"
    }
  }
  
  return (
    <div onClick={e => {e.stopPropagation(); onClick(row, col)}} style={getStyle()}>
      <>
        {board.grid[row][col] !== 0 && (
          <p style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
            {board.grid[row][col]}
          </p>
        )}
        <div 
          style={{
            position: "absolute", 
            inset: 0,
            pointerEvents: "none",
            backgroundColor: error ? "#f001" : ""  
          }}
        />
      </>
    </div>
  )
}

export default SudokuCell;