import { useState,useEffect } from 'react'
import {useLocalStorage} from './hooks/LocalStorage'
import type { TableData } from './types';
import './App.css'
import AsztalAdatok from './data/tables.json'
import { getTableDimensions } from './utils';
import Terem from './components/Terem';
import ReszletesNezet from './components/ReszletesNezet';
import Osszesito from './components/Osszesito';
import UjAsztal from './components/UjAsztal';


function App() {

  const [tables, setTables] = useLocalStorage<TableData[]>('roomlie-tables', AsztalAdatok as TableData[]);

  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [roomSize, setRoomSize] = useState({ width: 800, height: 600 });
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [draftTable, setDraftTable] = useState<Omit<TableData, 'id' | 'position'> | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getMaxRoomWidth = () => {
    const isMobile = window.innerWidth <= 850;
    const padding = 40;
    const detailsPanelWidth = 330;

    return isMobile 
      ? window.innerWidth - padding 
      : window.innerWidth - detailsPanelWidth - padding;
  };

  useEffect(() => {
    const handleResize = () => {
      const maxAvailableWidth = getMaxRoomWidth();
      
      setRoomSize(prev => {
        if (prev.width > maxAvailableWidth) {
          return { ...prev, width: maxAvailableWidth };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTables(prevTables => {
      let hasChanges = false;
      
      const updatedTables = prevTables.map(table => {
        const { w, h, buffer } = getTableDimensions(table.type);
        let newX = table.position.x;
        let newY = table.position.y;

        if (newX + w + buffer > roomSize.width) {
          newX = Math.max(buffer, roomSize.width - w - buffer);
          hasChanges = true;
        }
        if (newY + h + buffer > roomSize.height) {
          newY = Math.max(buffer, roomSize.height - h - buffer);
          hasChanges = true;
        }

        if (newX !== table.position.x || newY !== table.position.y) {
          return { ...table, position: { x: newX, y: newY } };
        }
        return table;
      });

      return hasChanges ? updatedTables : prevTables;
    });
  }, [roomSize.width, roomSize.height]);

  const handleSizeChange = (newWidth: number, newHeight: number) => {
    const maxAvailableWidth = getMaxRoomWidth();
    setRoomSize({ 
      width: Math.min(newWidth, maxAvailableWidth), 
      height: Math.max(100, newHeight)
    });
    setTables([]);
    setSelectedTableId(null);
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter(t => t.id !== id));
    setSelectedTableId(null);
  };

  const handleStatusChange = (id: number, newStatus: number) => {
    setTables(tables.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));
  };

  const handleStartPlacement = (draftData: Omit<TableData, 'id' | 'position'>) => {
    setDraftTable(draftData);
    setIsAddTableOpen(false);
  };

  const handleDragStart = (id: number, offsetX: number, offsetY: number) => {
    setDraggingId(id);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedTableId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragMove = (e: React.MouseEvent, roomRect: DOMRect) => {
    if (draggingId === null) return;

    const table = tables.find(t => t.id === draggingId);
    if (!table) return;

    let newX = Math.round(e.clientX - roomRect.left - dragOffset.x);
    let newY = Math.round(e.clientY - roomRect.top - dragOffset.y);

    const { w, h, buffer } = getTableDimensions(table.type);
    if (newX < buffer) newX = buffer;
    if (newY < buffer) newY = buffer;
    if (newX + w + buffer > roomSize.width) newX = roomSize.width - w - buffer;
    if (newY + h + buffer > roomSize.height) newY = roomSize.height - h - buffer;

    if (hasPhysicalCollision(newX, newY, w, h, draggingId)) {
      return;
    }

    setTables(tables.map(t => 
      t.id === draggingId ? { ...t, position: { x: newX, y: newY } } : t
    ));
  };

  const handleRoomClick = (x: number, y: number) => {
    if (!draftTable) return;
    const { w, h, buffer } = getTableDimensions(draftTable.type);

    if (
      x - buffer < 0 || 
      y - buffer < 0 || 
      x + w + buffer > roomSize.width || 
      y + h + buffer > roomSize.height
    ) {
      alert("Itt nem fér el! Túl közel van a falhoz (helyigény sérül).");
      return;
    }

    if (hasPhysicalCollision(x, y, w, h, null)) {
      alert("Ide nem teheted, mert egy másik asztalra lógna!");
      return;
    }

    const newTable: TableData = {
      ...draftTable,
      id: Date.now(),
      position: { x, y }
    };

    setTables([...tables, newTable]);
    setDraftTable(null);
  };

  const hasPhysicalCollision = (x: number, y: number, w: number, h: number, ignoreId: number | null) => {
    return tables.some(t => {
      if (t.id === ignoreId) return false;
      const tDim = getTableDimensions(t.type);
      
      return !(
        x + w <= t.position.x ||
        x >= t.position.x + tDim.w ||
        y + h <= t.position.y ||
        y >= t.position.y + tDim.h
      );
    });
  };

  const getConflictedIds = () => {
    const ids = new Set<number>();

    tables.forEach(tableA => {
      const dimA = getTableDimensions(tableA.type);
      
      const auraA = {
        left: tableA.position.x - dimA.buffer,
        right: tableA.position.x + dimA.w + dimA.buffer,
        top: tableA.position.y - dimA.buffer,
        bottom: tableA.position.y + dimA.h + dimA.buffer
      };

      tables.forEach(tableB => {
        if (tableA.id === tableB.id) return;
        const dimB = getTableDimensions(tableB.type);

        const noOverlap = (
          auraA.right <= tableB.position.x ||
          auraA.left >= tableB.position.x + dimB.w ||
          auraA.bottom <= tableB.position.y ||
          auraA.top >= tableB.position.y + dimB.h
        );

        if (!noOverlap) {
          ids.add(tableA.id);
        }
      });
    });

    return Array.from(ids);
  };

  const conflictedIds = getConflictedIds();

  const selectedTable = tables.find(t => t.id === selectedTableId) || null;

  return (
      <div className="app-container">
      <h1>Roomlie - Teremkezelő</h1>
        <div className="main-content">
          <Terem
            tables={tables} 
            roomSize={roomSize}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            onSizeChange={handleSizeChange}
            onRoomClick={handleRoomClick}
            isPlacementMode={draftTable !== null}
            conflictedTableIds={conflictedIds}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            draggingId={draggingId}
          />
          <ReszletesNezet 
            table={selectedTable}
            onDelete={handleDeleteTable}
            onStatusChange={handleStatusChange}
            onClose={() => setSelectedTableId(null)}
          />
        </div>
        <div className='osszesito'>
          <Osszesito tables={tables}/>
        </div>
        <div className="toolbar">
          <button className="add-table-btn" onClick={() => setIsAddTableOpen(true)}>
            Új asztal hozzáadása
          </button>
          {draftTable && <span className="placement-warning">Kattints a teremre az asztal lehelyezéséhez!</span>}
        </div>

        {isAddTableOpen && (
          <UjAsztal 
            onClose={() => setIsAddTableOpen(false)} 
            onStartPlacement={handleStartPlacement} 
          />
        )}
      </div>
  )
}

export default App