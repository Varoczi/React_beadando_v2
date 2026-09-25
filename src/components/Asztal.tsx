import type { TableData } from "../types.ts";
import "./Asztal.css";

interface TableProps {
  data: TableData;
  scale: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  isConflicted: boolean;
  onDragStart: (id: number, offsetX: number, offsetY: number) => void;
}

function Asztal({
  data,
  scale,
  isSelected,
  onSelect,
  isConflicted,
  onDragStart,
}: TableProps) {
  let width = 0;
  let height = 0;

  if (data.type === "snooker") {
    width = 190;
    height = 100;
  } else if (data.type === "air-hockey") {
    width = 140;
    height = 70;
  } else if (data.type === "foosball") {
    width = 120;
    height = 60;
  }

  const opacityValue = 0.2 + (data.status / 10) * 0.8;

  const tableStyle: React.CSSProperties = {
    position: "absolute",
    left: `${data.position.x}px`,
    top: `${data.position.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: data.color,
    opacity: opacityValue,
    cursor: data["isLocked"] ? "not-allowed" : "grab",
    border: isConflicted ? "3px solid red" : undefined,
    boxShadow: isConflicted ? "0 0 10px red" : undefined,
    borderColor: isConflicted ? "red" : undefined,
    zIndex: isConflicted ? 10 : 1,
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (data["isLocked"]) return;

    e.preventDefault();
    e.stopPropagation();

    const tableRect = e.currentTarget.getBoundingClientRect();
    const offsetX = Math.round((e.clientX - tableRect.left) / scale);
    const offsetY = Math.round((e.clientY - tableRect.top) / scale);

    onDragStart(data.id, offsetX, offsetY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (data["isLocked"]) return;
    e.stopPropagation();

    const tableRect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = Math.round((touch.clientX - tableRect.left) / scale);
    const offsetY = Math.round((touch.clientY - tableRect.top) / scale);

    onDragStart(data.id, offsetX, offsetY);
  };

  return (
    <div
      className={`table-container category-${data.category} ${isSelected ? "selected" : ""}`}
      style={tableStyle}
      onClick={() => onSelect(data.id)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <span className="table-label">{data.type}</span>
      {data["isLocked"] && <span className="lock-icon">🔒</span>}
    </div>
  );
}

export default Asztal;
