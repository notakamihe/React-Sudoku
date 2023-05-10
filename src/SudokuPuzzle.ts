export enum PuzzleDifficulty { EASY, MEDIUM, HARD, EVIL }

export default class SudokuPuzzle {
  complete: number[][];
  grid: number[][];

  constructor(grid: number[][], complete: number[][]) {
    this.grid = grid.map(row => row.slice());
    this.complete = complete.map(row => row.slice());
  }

  static generatePuzzle(difficulty?: PuzzleDifficulty): SudokuPuzzle {
    const puzzleArr = [];

    for (let i = 0; i < 9; i++)
      puzzleArr.push(new Array(9).fill(0));

    const puzzle = new SudokuPuzzle(puzzleArr, puzzleArr);

    puzzle.generate(0, 0);
    puzzle.grid = puzzle.complete.map(row => row.slice())
    puzzle.hideCells(difficulty ?? PuzzleDifficulty.EASY);

    return puzzle;
  }

  copy() {
    return new SudokuPuzzle(this.grid, this.complete);
  }

  countSolutions(grid: number[][]): number {
    let numSolutions = 0;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidCell(grid, i, j, num)) {
              grid[i][j] = num;
              numSolutions += this.countSolutions(grid);
              grid[i][j] = 0;
            }
          }

          return numSolutions;
        }
      }
    }

    return 1;
  }

  generate(row: number, col: number): boolean {
    if (col === 9) {
      col = 0;
      row++;
    }

    if (row === 9)
      return true;

    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.shuffle(values);

    for (const value of values) {
      this.complete[row][col] = value;
      
      if (this.isValidCell(this.complete, row, col, value))
        if (this.generate(row, col + 1))
          return true;
    }

    this.complete[row][col] = 0;
    return false;
  }

  hideCells(difficulty: PuzzleDifficulty) {
    let numCellsToHide;

    switch (difficulty) {
      case PuzzleDifficulty.EASY:
        numCellsToHide = Math.floor(Math.random() * 7) + 24;
        break;
      case PuzzleDifficulty.MEDIUM:
        numCellsToHide = Math.floor(Math.random() * 10) + 31;
        break;
      case PuzzleDifficulty.HARD:
        numCellsToHide = Math.floor(Math.random() * 10) + 41;
        break;
      case PuzzleDifficulty.EVIL:
        numCellsToHide = Math.floor(Math.random() * 14) + 53;
        break;
    }

    let attempts = 0;

    while (attempts < 350 && numCellsToHide > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (this.grid[row][col] !== 0) {
        const removed = this.grid[row][col];

        this.grid[row][col] = 0;
        
        const copy = this.grid.map(row => row.slice());
        const solutions = this.countSolutions(copy);

        if (solutions === 1)
          numCellsToHide--;
        else
          this.grid[row][col] = removed;
      }

      attempts++;
    }
  }

  isCellSolved(row: number, col: number) {
    return this.grid[row][col] === this.complete[row][col];
  }

  isNumberSolved(num: number) {
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 9; j++)
        if (this.complete[i][j] === num && !this.isCellSolved(i, j))
          return false;

    return true;
  }

  isSolved() {
    return this.grid.every((row, i) => row.every((cell, j) => cell === this.complete[i][j]));
  }

  isValidCell(grid: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 9; i++)
      if ((grid[row][i] === num && i !== col) || (grid[i][col] === num && i !== row))
        return false;

    const subRow = Math.floor(row / 3) * 3;
    const subCol = Math.floor(col / 3) * 3;

    for (let i = subRow; i < subRow + 3; i++)
      for (let j = subCol; j < subCol + 3; j++)
        if (grid[i][j] === num && i !== row && j !== col)
          return false;

    return true;
  }

  shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
}