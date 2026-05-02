import type { TableType } from './types.ts'

export const getTableDimensions = (type: TableType) => {
  switch (type) {
    case 'snooker': return { w: 190, h: 100, buffer: 50 };
    case 'air-hockey': return { w: 140, h: 70, buffer: 40 };
    case 'foosball': return { w: 120, h: 60, buffer: 30 };
  }
};