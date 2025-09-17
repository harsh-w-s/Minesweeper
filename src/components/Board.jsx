import Cell from "./Cell.jsx";
import "./Board.css";
import { useEffect, useRef, useState } from "react";

// Generate a new board
const generateBoard = (rows, cols, mines, rowClicked, colClicked) => {
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      value: 0,
      revealed: false,
      flagged: false,
    }))
  );

  const minesLocation = [];
  let minesLeft = mines;

  // Place mines avoiding first click
  while (minesLeft > 0) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (matrix[r][c].value !== "*" && (r !== rowClicked || c !== colClicked)) {
      matrix[r][c].value = "*";
      minesLocation.push([r, c]);
      minesLeft--;
    }
  }

  // Count adjacent mines
  for (const [r, c] of minesLocation) {
    for (let i = r - 1; i <= r + 1; i++) {
      for (let j = c - 1; j <= c + 1; j++) {
        if (
          i >= 0 &&
          i < rows &&
          j >= 0 &&
          j < cols &&
          matrix[i][j].value !== "*"
        ) {
          matrix[i][j].value += 1;
        }
      }
    }
  }

  return [matrix, minesLocation];
};

// Recursive function to reveal zeros and adjacent cells
const revealZeros = (matrix, r, c) => {
  if (
    r < 0 ||
    r >= matrix.length ||
    c < 0 ||
    c >= matrix[0].length ||
    matrix[r][c].revealed ||
    matrix[r][c].flagged
  )
    return 0;

  matrix[r][c].revealed = true;
  let revealedCount = 1;

  if (matrix[r][c].value === 0) {
    // 8 directions
    revealedCount += revealZeros(matrix, r - 1, c);
    revealedCount += revealZeros(matrix, r + 1, c);
    revealedCount += revealZeros(matrix, r, c - 1);
    revealedCount += revealZeros(matrix, r, c + 1);
    revealedCount += revealZeros(matrix, r - 1, c - 1);
    revealedCount += revealZeros(matrix, r - 1, c + 1);
    revealedCount += revealZeros(matrix, r + 1, c - 1);
    revealedCount += revealZeros(matrix, r + 1, c + 1);
  }

  return revealedCount;
};

const Board = ({ rows, cols, mines, ...rest }) => {
  let gameData = generateBoard(rows, cols, mines, -1, -1);

  const [matrix, setMatrix] = useState(gameData[0]);
  const [minesLocation, setMinesLocation] = useState(gameData[1]);
  const [minesPlaced, setMinesPlaced] = useState(false);
  const [left, setLeft] = useState(rows * cols - mines);

  const [gameOver, setGameOver] = useState(false);

  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (rest.gameStarted && !gameOver && minesPlaced && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    if ((gameOver || !rest.gameStarted) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [rest.gameStarted, gameOver, minesPlaced]);

  // Win condition
  useEffect(() => {
    if (minesPlaced && left === 0 && !gameOver) {
      setGameOver(true);
      alert("You Win!");
    }
  }, [left, minesPlaced, rest, gameOver]);

  const handleClick = (r, c) => {
    setMatrix((prev) => {
      const newMat = prev.map((row) => row.map((cell) => ({ ...cell })));

      // First click - generate mines
      if (!minesPlaced) {
        rest.setGameStarted(true);
        const newGame = generateBoard(rows, cols, mines, r, c);
        setMatrix(newGame[0]);
        setMinesLocation(newGame[1]);
        const newBoard = newGame[0];
        const totalRevealed =
          newBoard[r][c].value === 0 ? revealZeros(newBoard, r, c) : 1;
        if (newBoard[r][c].value !== 0) newBoard[r][c].revealed = true;
        setLeft((prevLeft) => prevLeft - totalRevealed);
        setMinesPlaced(true);
        console.log(newBoard);

        return newBoard;
      }

      if (newMat[r][c].flagged || newMat[r][c].revealed) return newMat;

      // Clicked on mine
      if (newMat[r][c].value === "*") {
        newMat[r][c].revealed = true;
        setGameOver(true);
        rest.setGameStarted(false);
        minesLocation.forEach(([r1, c1], index) => {
          setTimeout(() => {
            setMatrix((prev) => {
              const updated = prev.map((row) =>
                row.map((cell) => ({ ...cell }))
              );
              updated[r1][c1].revealed = true;
              return updated;
            });
          }, 50 * index);
        });
        const tempMat = newMat.map((row) => row.map((cell) => ({ ...cell })));
        matrix.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            tempMat[rowIndex][colIndex].revealed = true;
          });
        });
        setTimeout(() => {
          setMatrix((prev) => {
            return tempMat;
          });
          alert("Game Over!");
        }, minesLocation.length * 50 + 500);
        return newMat;
      }

      // Reveal zeros or number
      const revealed = newMat[r][c].value === 0 ? revealZeros(newMat, r, c) : 1;
      if (newMat[r][c].value !== 0) newMat[r][c].revealed = true;
      setLeft((prevLeft) => prevLeft - revealed);

      return newMat;
    });
  };

  const handleFlag = (e, r, c) => {
    e.preventDefault();
    setMatrix((prev) => {
      const newMat = prev.map((row) => row.map((cell) => ({ ...cell })));
      if (!newMat[r][c].revealed) newMat[r][c].flagged = !newMat[r][c].flagged;
      return newMat;
    });
  };

  return (
    <div className="board">
      <header className="board-header">
        <button
          className="start"
          onClick={() => {
            setMatrix(generateBoard(rows, cols, mines, -1, -1)[0]);
            setMinesPlaced(false);
            setLeft(rows * cols - mines);
            setGameOver(false);
            rest.setGameStarted(false);
            setTimer(0);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }}
        >
          Start
        </button>
        <div className="clock">
          <img src={"/clock.png"}></img>
          <h3>{timer}</h3>
        </div>
      </header>
      <div
        className="cells"
        style={{
          gridTemplateColumns: `repeat(${cols}, 25px)`,
          gridTemplateRows: `repeat(${rows}, 25px)`,
        }}
      >
        {matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              id={`${rowIndex}-${colIndex}`}
              value={cell.value}
              revealed={cell.revealed}
              flagged={cell.flagged}
              onClick={() => handleClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleFlag(e, rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
