import { useState } from "react";
import type { TableType, TableCategory, TableData } from "../types";
import "./UjAsztal.css";

interface AddTableProps {
  onClose: () => void;
  onStartPlacement: (draftData: Omit<TableData, "id" | "position">) => void;
}

function UjAsztal({ onClose, onStartPlacement }: AddTableProps) {
  const [type, setType] = useState<TableType>("foosball");
  const [category, setCategory] = useState<TableCategory>("normal");
  const [color, setColor] = useState("blue");
  const [status, setStatus] = useState(10);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartPlacement({
      type,
      category,
      color,
      status,
      isLocked: isLocked,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Új asztal hozzáadása</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Típus:
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TableType)}
            >
              <option value="foosball">Csocsó (Foosball)</option>
              <option value="air-hockey">Léghoki (Air-hockey)</option>
              <option value="snooker">Biliárd (Snooker)</option>
            </select>
          </label>

          <label>
            Kategória:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TableCategory)}
            >
              <option value="kids">Gyerek</option>
              <option value="normal">Normál</option>
              <option value="competition">Verseny</option>
            </select>
          </label>

          <label>
            Szín:
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="red">Piros</option>
              <option value="blue">Kék</option>
              <option value="green">Zöld</option>
              <option value="yellow">Sárga</option>
              <option value="purple">Lila</option>
            </select>
          </label>

          <label>
            Állapot ({status}):
            <input
              type="range"
              min="1"
              max="10"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
            />
            Hely fixálása (nem mozgatható)
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Mégse
            </button>
            <button type="submit" className="submit-btn">
              Tovább a lehelyezéshez
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UjAsztal;
