import { MoveLog } from "../utils/types";

const MovesLogModal = ({ movesLog, show, onClose }: {
    movesLog: MoveLog[],
    show: boolean,
    onClose: () => void
 }) => {
  return (
      <div className={`moves-log-modal ${show ? "" : "remove"}`}>
      <div className="moves-log-modal-content">
        <span className="close" onClick={() => onClose()}>&times;</span>
        <h2>Moves Log</h2>
        <ul>
          {movesLog.map((move, index) => (
            <li key={index}>
              <span>{`Move ${index + 1} `}</span>
              <span>{`Tower ${move.from + 1} -> Tower ${move.to + 1}`}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MovesLogModal;