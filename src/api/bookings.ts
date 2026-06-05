import { apiClient } from './client';

export interface BookingData {
  id: number;
  tableId: number;
  tableName: string;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  headcount: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface CreateBookingInput {
  tableId: number;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  headcount: number;
  notes?: string;
}

export const fetchMyBookings = async (): Promise<BookingData[]> => {
  return await apiClient('/bookings/my');
};

export const fetchAllBookings = async (): Promise<BookingData[]> => {
  return await apiClient('/bookings');
};

export const createBooking = async (data: CreateBookingInput): Promise<BookingData> => {
  return await apiClient('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateBookingStatus = async (id: number, status: 'accepted' | 'declined'): Promise<BookingData> => {
  return await apiClient(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};