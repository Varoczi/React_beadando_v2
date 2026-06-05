import { useSelector } from 'react-redux'
import type { TableData } from '../types'
import Asztal from './Asztal.tsx'
import './Terem.css'
import type { RootState } from '../store/store.ts'

interface RoomProps {
  tables: TableData[]
  roomSize: { width: number; height: number }
  selectedTableId: number | null
  onSelectTable: (id: number) => void
  onRoomClick?: (x: number, y: number) => void
  isPlacementMode?: boolean
  conflictedTableIds: number[]
  onDragStart: (id: number, offsetX: number, offsetY: number) => void
  onDragMove: (e: React.MouseEvent, roomRect: DOMRect) => void
  onDragEnd: () => void
  draggingId: number | null
}

function Terem({ tables, roomSize, selectedTableId, onSelectTable, onRoomClick, isPlacementMode, conflictedTableIds, onDragStart, onDragMove, onDragEnd, draggingId }: RoomProps) {
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingId !== null) {
      const roomRect = e.currentTarget.getBoundingClientRect()
      onDragMove(e, roomRect)
    }
  }

  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="room-wrapper">
      <div 
        className={`room-area ${isPlacementMode ? 'placement-mode' : ''}`} 
        style={{ width: `${roomSize.width}px`, height: `${roomSize.height}px`, cursor: isPlacementMode ? 'crosshair' : 'default' }}
        onClick={(e) => {
          if (!isPlacementMode || !onRoomClick) return
          
          const rect = e.currentTarget.getBoundingClientRect()
          const x = Math.round(e.clientX - rect.left)
          const y = Math.round(e.clientY - rect.top)
          
          onRoomClick(x, y);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
      >
        {tables.map(table => (
          <Asztal 
            key={table.id} 
            data={table} 
            isSelected={table.id === selectedTableId}
            isConflicted={conflictedTableIds.includes(table.id)}
            onSelect={(id) => {
              if (user) {
                onSelectTable(id)
              }
            }}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}

export default Terem