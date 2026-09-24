import initialTables from '../data/tables.json';

const getDb = (key: string) => {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};
const setDb = (key: string, data: any) => {
    window.localStorage.setItem(key, JSON.stringify(data));
};

if (!getDb('mock_tables')) setDb('mock_tables', initialTables);
if (!getDb('mock_users')) setDb('mock_users', []);
if (!getDb('mock_bookings')) setDb('mock_bookings', []);

// MOCK API KLIENS
export async function apiClient(endpoint: string, options: RequestInit = {}) {
    await new Promise(resolve => setTimeout(resolve, 400));

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;
    
    const userStr = window.localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    console.log(`[Mock API] ${method} ${endpoint}`, body || '');

    // ===============================================
    // 1. AUTENTIKÁCIÓ (Bejelentkezés / Regisztráció)
    // ===============================================
    if (endpoint === '/auth/login' && method === 'POST') {
        const { email, password } = body;
        
        if (email === 'admin@example.com' && password === 'admin123') {
            return { token: 'mock-token-admin', user: { name: 'Adminisztrátor', email, role: 'admin' } };
        }
        
        const users = getDb('mock_users');
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
            return { token: `mock-token-${user.email}`, user: { name: user.name, email: user.email, role: 'user' } };
        }
        throw new Error("Hibás email vagy jelszó!");
    }

    if (endpoint === '/auth/register' && method === 'POST') {
        const users = getDb('mock_users');
        if (users.some((u: any) => u.email === body.email)) {
            throw new Error("Ez az email cím már foglalt!");
        }
        users.push(body);
        setDb('mock_users', users);
        return { success: true };
    }

    // =====================
    // 2. ASZTALOK KEZELÉSE
    // =====================
    if (endpoint === '/tables' && method === 'GET') {
        return getDb('mock_tables');
    }

    if (endpoint === '/tables' && method === 'POST') {
        const tables = getDb('mock_tables');
        const newTable = { ...body, id: Date.now() };
        tables.push(newTable);
        setDb('mock_tables', tables);
        return newTable;
    }

    if (endpoint.startsWith('/tables/') && method === 'PATCH') {
        const tables = getDb('mock_tables');
        const urlParts = endpoint.split('/');
        const id = Number(urlParts[2]);
        const isPosition = urlParts[3] === 'position';
        
        const tableIndex = tables.findIndex((t: any) => t.id === id);
        if (tableIndex === -1) throw new Error("Asztal nem található");

        if (isPosition) {
            tables[tableIndex].position = body;
        } else {
            tables[tableIndex] = { ...tables[tableIndex], ...body };
        }
        
        setDb('mock_tables', tables);
        return tables[tableIndex];
    }

    if (endpoint.startsWith('/tables/') && method === 'DELETE') {
        let tables = getDb('mock_tables');
        const id = Number(endpoint.split('/')[2]);
        tables = tables.filter((t: any) => t.id !== id);
        setDb('mock_tables', tables);
        return null;
    }

    // ===========================
    // 3. IDŐPONTOK ÉS FOGLALÁSOK
    // ===========================
    if (endpoint.match(/\/tables\/\d+\/timeslots/) && method === 'GET') {
        const urlParams = new URLSearchParams(endpoint.split('?')[1]);
        const date = urlParams.get('date');
        const tableId = Number(endpoint.split('/')[2]);
        
        const slots = [
            { startTime: "10:00", endTime: "12:00", isAvailable: true },
            { startTime: "12:00", endTime: "14:00", isAvailable: true },
            { startTime: "14:00", endTime: "16:00", isAvailable: true },
            { startTime: "16:00", endTime: "18:00", isAvailable: true },
            { startTime: "18:00", endTime: "20:00", isAvailable: true },
        ];
        
        const bookings = getDb('mock_bookings');
        const takenSlots = bookings.filter((b: any) => b.tableId === tableId && b.date === date && b.status !== 'declined');
        
        return slots.map(slot => {
            const isTaken = takenSlots.some((b: any) => b.startTime === slot.startTime);
            return { ...slot, isAvailable: !isTaken };
        });
    }

    if (endpoint === '/bookings/my' && method === 'GET') {
        const bookings = getDb('mock_bookings');
        return bookings.filter((b: any) => b.email === currentUser?.email);
    }

    if (endpoint === '/bookings' && method === 'GET') {
        return getDb('mock_bookings');
    }

    if (endpoint === '/bookings' && method === 'POST') {
        const bookings = getDb('mock_bookings');
        
        const tables = getDb('mock_tables');
        const table = tables.find((t: any) => t.id === body.tableId);
        const tableName = table ? `${table.type === 'foosball' ? 'Csocsó' : table.type === 'snooker' ? 'Biliárd' : 'Léghoki'} (ID: ${table.id})` : `Asztal ${body.tableId}`;

        const newBooking = { ...body, id: Date.now(), status: 'pending', tableName };
        bookings.push(newBooking);
        setDb('mock_bookings', bookings);
        return newBooking;
    }

    if (endpoint.match(/\/bookings\/\d+\/status/) && method === 'PATCH') {
        const bookings = getDb('mock_bookings');
        const id = Number(endpoint.split('/')[2]);
        const bookingIndex = bookings.findIndex((b: any) => b.id === id);
        
        if (bookingIndex === -1) throw new Error("Foglalás nem található");
        
        bookings[bookingIndex].status = body.status;
        setDb('mock_bookings', bookings);
        return bookings[bookingIndex];
    }

    throw new Error(`Nincs implementálva a Mock API-ban: ${method} ${endpoint}`);
}