import { apiClient } from './client';
import { type TableData } from '../types';

export interface Timeslot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const fetchTables = async (): Promise<TableData[]> => {
  return await apiClient('/tables'); 
};

export const createTable = async (data: Omit<TableData, 'id'>) => {
  return await apiClient('/tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTableDetails = async (id: number, data: Partial<TableData>) => {
  return await apiClient(`/tables/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteTable = async (id: number) => {
  return await apiClient(`/tables/${id}`, {
    method: 'DELETE',
  });
};

export const updateTablePosition = async (id: number, position: { x: number, y: number }) => {
  return await apiClient(`/tables/${id}/position`, {
    method: 'PATCH',
    body: JSON.stringify(position)
  });
};

export const fetchTableTimeslots = async (tableId: number, date: string): Promise<Timeslot[]> => {
  return await apiClient(`/tables/${tableId}/timeslots?date=${date}`);
};