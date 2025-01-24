import React, { useEffect, useState } from "react";
import useCanvas from "./hooks/useCanvas.tsx";
import MovesLogModal from "./components/moves_log_modal.tsx";
import { towerOfHanoiSolver } from "./utils/solver.ts";
import SuccessMessage from "./components/success_message.tsx";

const TowerOfHanoi: React.FC = () => {
  const [diskCount, setDiskCount] = useState<number>(3);
  const [canvasRef, moves, movesLog, solved, solving, handleSolve, handleRestart] = useCanvas(diskCount);
  const [showMovesLog, setShowMovesLog] = useState<boolean>(false);
  const [minMoves, setMinMoves] = useState<number>(towerOfHanoiSolver(diskCount, 0, 1, 2).length);

  useEffect(() => {
    setMinMoves(towerOfHanoiSolver(diskCount, 0, 1, 2).length);
  }, [diskCount]);

  return (<>
    <div className="tower-of-hanoi">
      <div className="title-container"><h1 className="title">Tower of Hanoi</h1></div>
      <div className="header-container">
        <div className="controls-container">
          <div className="controls">
            <label>Disks:</label>
            <button className="control-button" onClick={() => setDiskCount((prev) => {
              if (solving) {handleRestart();return prev;}
              return Math.max(3, prev - 1);
            })}>▼</button>
            <span className="disk-count">{diskCount}</span>
            <button className="control-button" onClick={() => setDiskCount((prev) => {
              if (solving) { handleRestart(); return prev; }
              return Math.min(8, prev + 1)
            })}>▲</button>
          </div>
          <div className="action-buttons">
            <button className="action-button" onClick={() => { handleRestart() }}>Restart</button>
            <button className="action-button" onClick={() => setShowMovesLog(true)}>Log</button>
            <button className="action-button"
              disabled={solving}
              style={{ backgroundColor: solving ? "gray" : "green", cursor: solving ? "not-allowed" : "pointer" }}
              onClick={() => handleSolve()}>Solve!</button>
          </div>
        </div>
        <div className="description-container">
          <p className="description">
            Move the disks from the leftmost tower to the rightmost tower. You can
            only move one disk at a time and you can never place a larger disk on
            top of a smaller disk.
          </p>
          <span className="moves-counter">
            <span>moves: {moves}</span>
            <span>min-moves: {minMoves}</span>
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} width={600} height={400} className="canvas" id="canvas" />
    </div>
    <MovesLogModal movesLog={movesLog} show={showMovesLog} onClose={() => setShowMovesLog(false)} />
    <SuccessMessage show={solved} message="Welldone!" />
  </>);
};

export default TowerOfHanoi;
