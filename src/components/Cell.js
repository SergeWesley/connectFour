import React from "react";

const Cell = ({ value, isWinning, row, col, animating }) => {
  const getCellClass = () => {
    let className = "cell";

    if (value === 1) className += " player1";
    else if (value === 2) className += " player2";

    if (isWinning) className += " winning";
    if (animating) className += " dropping";

    return className;
  };

  return (
    <div className={getCellClass()}>
      <div className="cell-inner">
        {value !== 0 && <div className="piece"></div>}
      </div>
    </div>
  );
};

export default Cell;
