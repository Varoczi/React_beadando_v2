import { useState,useEffect } from 'react'
import type { TableData } from '../types'
import './Home.css'
import { getTableDimensions } from '../utils'
import Terem from '../components/Terem'
import ReszletesNezet from '../components/ReszletesNezet'
import Osszesito from '../components/Osszesito'
import UjAsztal from '../components/UjAsztal'
import { useSelector } from 'react-redux'
import { type RootState } from '../store/store'
import { 
  fetchTables, 
  updateTablePosition, 
  createTable, 
  updateTableDetails, 
  deleteTable 
} from '../api/tables'
import toast from 'react-hot-toast'

function Home() {

    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === 'admin'

    const [tables, setTables] = useState<TableData[]>([])

    const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
    const [roomSize, setRoomSize] = useState({ width: 1200, height: 700 })
    const [isAddTableOpen, setIsAddTableOpen] = useState(false)
    const [draftTable, setDraftTable] = useState<Omit<TableData, 'id' | 'position'> | null>(null)
    const [draggingId, setDraggingId] = useState<number | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const loadTables = async () => {
            try {
                const data = await fetchTables()
                setTables(data)
            } catch (error) {
                console.error("Hiba az asztalok betöltésekor:", error)
            }
        }
        loadTables()
    }, [])

    const getMaxRoomWidth = () => {
        const isMobile = window.innerWidth <= 850
        const padding = 40
        const detailsPanelWidth = user ? 330 : 0

        return isMobile 
        ? window.innerWidth - padding 
        : window.innerWidth - detailsPanelWidth - padding
    };

    useEffect(() => {
        const handleResize = () => {
        const maxAvailableWidth = getMaxRoomWidth()
        
        setRoomSize(prev => {
            if (prev.width > maxAvailableWidth) {
            return { ...prev, width: maxAvailableWidth }
            }
            return prev
        })
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [user])

    useEffect(() => {
        setTables(prevTables => {
        let hasChanges = false
        
        const updatedTables = prevTables.map(table => {
            const { w, h, buffer } = getTableDimensions(table.type)
            let newX = table.position.x
            let newY = table.position.y

            if (newX + w + buffer > roomSize.width) {
            newX = Math.max(buffer, roomSize.width - w - buffer)
            hasChanges = true
            }
            if (newY + h + buffer > roomSize.height) {
            newY = Math.max(buffer, roomSize.height - h - buffer)
            hasChanges = true
            }

            if (newX !== table.position.x || newY !== table.position.y) {
            return { ...table, position: { x: newX, y: newY } }
            }
            return table
        });

        return hasChanges ? updatedTables : prevTables
        });
    }, [roomSize.width, roomSize.height])

    const handleDeleteTable = async (id: number) => {
    try {
      await deleteTable(id)
      
      setTables(tables.filter(t => t.id !== id))
      setSelectedTableId(null);
      toast.success("Asztal törlésre került!")
    } catch (error) {
      console.error("Hiba az asztal törlésekor:", error)
      toast.error('Nem sikerült törölni az asztalt!')
    }
  }

    const handleStatusChange = async (id: number, newStatus: number) => {
        setTables(tables.map(t => t.id === id ? { ...t, status: newStatus } : t))

        try {
            await updateTableDetails(id, { status: newStatus })
            toast.success("Módosítások sikeresen elmentve!")
        } catch (error) {
            console.error("Hiba a státusz frissítésekor:", error)
            toast.error("Nem sikerült menteni a módosítást a szerverre!")
        }
    }

    const handleStartPlacement = (draftData: Omit<TableData, 'id' | 'position'>) => {
        setDraftTable(draftData)
        setIsAddTableOpen(false)
    }

    const handleDragStart = (id: number, offsetX: number, offsetY: number) => {
        if (!isAdmin) return
        setDraggingId(id)
        setDragOffset({ x: offsetX, y: offsetY })
        setSelectedTableId(id)
    }

    const handleDragEnd = async () => {
        if (draggingId === null) return

        const movedTable = tables.find(t => t.id === draggingId)
        if (movedTable) {
            try {
                await updateTablePosition(draggingId, movedTable.position)
                toast.success("Helyzet sikeresen módosítva!")
            } catch (error) {
                console.error("Nem sikerült menteni a pozíciót a szerverre!")
                toast.error("Nem sikerült módosítani a pozíciót!")
            }
        }

        setDraggingId(null)
    }

    const handleDragMove = (e: React.MouseEvent, roomRect: DOMRect) => {
        if (draggingId === null) return

        const table = tables.find(t => t.id === draggingId)
        if (!table) return

        let newX = Math.round(e.clientX - roomRect.left - dragOffset.x)
        let newY = Math.round(e.clientY - roomRect.top - dragOffset.y)

        const { w, h, buffer } = getTableDimensions(table.type)
        if (newX < buffer) newX = buffer
        if (newY < buffer) newY = buffer
        if (newX + w + buffer > roomSize.width) newX = roomSize.width - w - buffer
        if (newY + h + buffer > roomSize.height) newY = roomSize.height - h - buffer

        if (hasPhysicalCollision(newX, newY, w, h, draggingId)) {
        return
        }

        setTables(tables.map(t => 
        t.id === draggingId ? { ...t, position: { x: newX, y: newY } } : t
        ))
    }

    const handleRoomClick = async (x: number, y: number) => {
        if (!draftTable) return;
        const { w, h, buffer } = getTableDimensions(draftTable.type)

        if (
        x - buffer < 0 || 
        y - buffer < 0 || 
        x + w + buffer > roomSize.width || 
        y + h + buffer > roomSize.height
        ) {
        toast.error('Itt nem fér el! Túl közel van a falhoz (helyigény sérül).')
        return
        }

        if (hasPhysicalCollision(x, y, w, h, null)) {
        toast.error('Ide nem teheted, mert egy másik asztalra lógna!')
        return
        }

        const autoGeneratedName = `Asztal ${tables.length + 1}`

        const tableDataToSend = {
            name: autoGeneratedName,
            type: draftTable.type,
            category: draftTable.category,
            color: draftTable.color,
            status: draftTable.status,
            isLocked: draftTable.isLocked,
            position: { x, y }
        }

        try {
            const savedTable = await createTable(tableDataToSend)
            setTables([...tables, savedTable])
            toast.success("Asztal sikeresen hozzáadva")
            setDraftTable(null)
        } catch (error) {
            console.error("Hiba az asztal létrehozásakor:", error)
            alert("Nem sikerült elmenteni az új asztalt a szerverre!")
        }
    }

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
            <h1>Roomlie {isAdmin && "- Teremkezelő"}</h1>
            <div className={`main-content ${user ? 'with-details' : ''}`}>
                <Terem
                tables={tables} 
                roomSize={roomSize}
                selectedTableId={selectedTableId}
                onSelectTable={setSelectedTableId}
                onRoomClick={handleRoomClick}
                isPlacementMode={draftTable !== null}
                conflictedTableIds={conflictedIds}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                draggingId={draggingId}
                />
                {user && (
                    <ReszletesNezet 
                    table={selectedTable}
                    onDelete={handleDeleteTable}
                    onStatusChange={handleStatusChange}
                    onClose={() => setSelectedTableId(null)}
                    />
                )}
            </div>
            <div className='osszesito'>
                <Osszesito tables={tables}/>
            </div>
            {isAdmin && (
                <div className="toolbar">
                    <button className="add-table-btn" onClick={() => setIsAddTableOpen(true)}>
                    Új asztal hozzáadása
                    </button>
                    {draftTable && <span className="placement-warning">Kattints a teremre az asztal lehelyezéséhez!</span>}
                </div>
            )}

            {isAdmin && isAddTableOpen && (
                <UjAsztal 
                onClose={() => setIsAddTableOpen(false)} 
                onStartPlacement={handleStartPlacement} 
                />
            )}
            </div>

    )
}

export default Home