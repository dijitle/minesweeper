import React, { useState, useEffect } from "react";

const createBoard = (rows, cols, mines) => {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );

  // place mines
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    /*self*/ [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine)
          count++;
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
};

const clone = (b) => b.map((row) => row.map((cell) => ({ ...cell })));

export default function App() {
  const [rows] = useState(9);
  const [cols] = useState(9);
  const [mines] = useState(10);
  const [board, setBoard] = useState(() => createBoard(rows, cols, mines));
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    checkWin();
  }, [board]);

  function reveal(r, c) {
    if (lost || won) return;
    const b = clone(board);
    const cell = b[r][c];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    if (cell.mine) {
      setLost(true);
      // reveal all mines
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++)
          if (b[i][j].mine) b[i][j].revealed = true;
      setBoard(b);
      return;
    }
    if (cell.adjacent === 0) floodFill(b, r, c);
    setBoard(b);
  }

  function floodFill(b, r, c) {
    const queue = [[r, c]];
    const visited = new Set();
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    while (queue.length) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (x < 0 || y < 0 || x >= rows || y >= cols) continue;
      const cell = b[x][y];
      cell.revealed = true;
      if (cell.adjacent === 0) {
        for (const [dx, dy] of dirs) queue.push([x + dx, y + dy]);
      }
    }
  }

  function toggleFlag(e, r, c) {
    e.preventDefault();
    if (lost || won) return;
    const b = clone(board);
    const cell = b[r][c];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    setBoard(b);
  }

  function reset() {
    setBoard(createBoard(rows, cols, mines));
    setLost(false);
    setWon(false);
  }

  function checkWin() {
    let ok = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (!cell.mine && !cell.revealed) ok = false;
      }
    }
    if (ok && !lost) setWon(true);
  }

  return (
    <div className="app">
      <h1>Minesweeper</h1>
      <div className="controls">
        <button onClick={reset}>Reset</button>
        <div>{lost ? "You hit a mine!" : won ? "You win!" : "Good luck!"}</div>
      </div>
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={"cell " + (cell.revealed ? "revealed" : "")}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
            >
              {cell.revealed
                ? cell.mine
                  ? "💣"
                  : cell.adjacent || ""
                : cell.flagged
                  ? "🚩"
                  : ""}
            </div>
          )),
        )}
      </div>
      <p className="hint">Left click to reveal, right click to flag.</p>
    </div>
  );
}
