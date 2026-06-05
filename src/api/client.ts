
export async function apiClient(endpoint: string, options: RequestInit = {}) {

    const baseUrl = import.meta.env.VITE_API_URL;
    const neptunCode = import.meta.env.VITE_NEPTUN_CODE;

    const headers = new Headers(options.headers);
    headers.append('Content-Type', 'application/json');

    const token = window.localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    if (neptunCode && import.meta.env.PROD) {
        headers.append('X-Neptun-Code', neptunCode);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.message || 'Valami hiba történt a szerverrel való kommunikáció során!');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null; 
    }
    
    return response.json();
}