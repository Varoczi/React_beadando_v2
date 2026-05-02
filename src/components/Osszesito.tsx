import type { TableData, TableType } from '../types.ts';
import './Osszesito.css';

interface StatsProps {
  tables: TableData[];
}

function Osszesito({ tables }: StatsProps) {
  const total = tables.length;

  const getStatsByType = (type: TableType) => {
    const filtered = tables.filter(t => t.type === type);
    const count = filtered.length;
    const avgStatus = count > 0 
      ? (filtered.reduce((sum, t) => sum + t.status, 0) / count).toFixed(1) 
      : 0;
    return { count, avgStatus };
  };

  const types: TableType[] = ['snooker', 'air-hockey', 'foosball'];

  return (
    <div className="stats-container">
      <div className="stats-item total">
        <strong>Összesen:</strong> {total} db
      </div>
      {types.map(type => {
        const { count, avgStatus } = getStatsByType(type);
        return (
          <div key={type} className="stats-item">
            <span className="type-name">{type}:</span>
            <span>{count} db (Átlag: {avgStatus})</span>
          </div>
        );
      })}
    </div>
  );
}

export default Osszesito;