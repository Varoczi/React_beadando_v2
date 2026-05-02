import type { TableData } from '../types.ts';
import './ReszletesNezet.css';

interface TableDetailsProps {
  table: TableData | null;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: number) => void;
  onClose: () => void;
}

function ReszletesNezet({ table, onDelete, onStatusChange, onClose }: TableDetailsProps) {
  if (!table) return <div className="details-placeholder">Válassz ki egy asztalt a részletekért!</div>;

  return (
    <div className="table-details">
      <div className="details-header">
        <h3>Asztal Részletei (#{table.id})</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="details-body">
        <p><strong>Típus:</strong> {table.type}</p>
        <p><strong>Kategória:</strong> {table.category}</p>
        <p><strong>Szín:</strong> {table.color}</p>
        <p><strong>Pozíció:</strong> X: {table.position.x}, Y: {table.position.y}</p>
        
        <div className="status-control">
          <label><strong>Állapot (1-10):</strong> {table.status}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={table.status} 
            onChange={(e) => onStatusChange(table.id, Number(e.target.value))}
          />
        </div>

        <p><strong>Státusz:</strong> {table['is-locked'] ? "🔒 Rögzítve" : "🔓 Mozgatható"}</p>
      </div>

      <button className="delete-btn" onClick={() => onDelete(table.id)}>
        Asztal törlése
      </button>
    </div>
  );
}

export default ReszletesNezet;