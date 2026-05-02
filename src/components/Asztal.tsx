import type { TableData } from '../types.ts';
import './Asztal.css';

interface TableProps {
  data: TableData;
  isSelected: boolean;
  onSelect: (id: number) => void;
  isConflicted: boolean;
  onDragStart: (id: number, offsetX: number, offsetY: number) => void;
}

function Asztal({ data, isSelected, onSelect, isConflicted, onDragStart }: TableProps) {
  let width = 0;
  let height = 0;
  
  if (data.type === 'snooker') {
    width = 190; height = 100;
  } else if (data.type === 'air-hockey') {
    width = 140; height = 70;
  } else if (data.type === 'foosball') {
    width = 120; height = 60;
  }

  const opacityValue = 0.2 + (data.status / 10) * 0.8;

  const tableStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${data.position.x}px`,
    top: `${data.position.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: data.color,
    opacity: opacityValue,
    cursor: data['is-locked'] ? 'not-allowed' : 'grab',
    border: isConflicted ? '3px solid red' : undefined,
    boxShadow: isConflicted ? '0 0 10px red' : undefined,
    borderColor: isConflicted ? 'red' : undefined,
    zIndex: isConflicted ? 10 : 1
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (data['is-locked']) return;
    
    e.preventDefault();
    e.stopPropagation();

    const tableRect = e.currentTarget.getBoundingClientRect();
    const offsetX = Math.round(e.clientX - tableRect.left);
    const offsetY = Math.round(e.clientY - tableRect.top);

    onDragStart(data.id, offsetX, offsetY);
  };

  return (
    <div 
      className={`table-container category-${data.category} ${isSelected ? 'selected' : ''}`}
      style={tableStyle}
      onClick={() => onSelect(data.id)}
      onMouseDown={handleMouseDown}
    >
      <span className="table-label">{data.type}</span>
      {data['is-locked'] && <span className="lock-icon">🔒</span>}
    </div>
  );
}

export default Asztal;