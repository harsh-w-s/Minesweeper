import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Board from "./components/Board.jsx";
import { useState } from "react";

function App() {
  const input = {
    rows: 20,
    cols: 20,
    mines: 30,
  };

  let [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="App">
      <h1>Minesweeper Game</h1>
      <Board
        rows={input.rows}
        cols={input.cols}
        mines={input.mines}
        gameStarted={gameStarted}
        setGameStarted={setGameStarted}
      />
    </div>
  );
}

export default App;
