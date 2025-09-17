import "./Cell.css";

const Cell = ({ value, revealed, flagged, onClick, onContextMenu }) => {
  let display = "";

  if (flagged) {
    display = "🚩";
  } else if (revealed) {
    if (value === 0) display = "";
    else if (value === "*") display = "💣";
    else display = value;
  }

  return (
    <div
      className={`cell ${revealed ? "revealed" : ""} ${
        display === "💣" ? "bomb" : ""
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {display}
    </div>
  );
};

export default Cell;
