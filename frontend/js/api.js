// API Configuration
const API_BASE_URL = window.location.origin + '/api';
const API_TOKEN = 'your_api_token_change_me'; // This should match .env

// API Client
export class API {
    static async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Token': API_TOKEN,
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Authentication API
export const AuthAPI = {
    async login(password) {
        return API.post('/auth/login', { password });
    },

    async verify(password) {
        return API.get('/auth/verify', {
            headers: { 'X-Management-Password': password }
        });
    }
};

// Users API
export const UsersAPI = {
    async getAll() {
        return API.get('/users');
    },

    async getById(userId) {
        return API.get(`/users?userId=${userId}`);
    },

    async getLoggedIn() {
        return API.get('/users/logged-in');
    },

    async create(name, rfidKey, password) {
        return API.request('/users', {
            method: 'POST',
            headers: {
                'X-Management-Password': password
            },
            body: JSON.stringify({ name, rfidKey })
        });
    },

    async update(userId, data, password) {
        return API.request(`/users/${userId}`, {
            method: 'PUT',
            headers: {
                'X-Management-Password': password
            },
            body: JSON.stringify(data)
        });
    },

    async delete(userId, password) {
        return API.request(`/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'X-Management-Password': password
            }
        });
    }
};

// Attendance API
export const AttendanceAPI = {
    async signIn(rfidKey) {
        return API.post('/attendance/sign-in', { rfidKey });
    },

    async signOut(userId, password) {
        return API.request('/attendance/sign-out', {
            method: 'POST',
            headers: {
                'X-Management-Password': password
            },
            body: JSON.stringify({ userId })
        });
    },

    async signOutAll(password) {
        return API.request('/attendance/sign-out-all', {
            method: 'POST',
            headers: {
                'X-Management-Password': password
            }
        });
    }
};

// Seasons API
export const SeasonsAPI = {
    async getAll() {
        return API.get('/seasons');
    },

    async getBySeason(date) {
        return API.get(`/seasons/${date}`);
    },

    async create(seasonStartDate, password) {
        return API.request('/seasons', {
            method: 'POST',
            headers: {
                'X-Management-Password': password
            },
            body: JSON.stringify({ seasonStartDate })
        });
    }
};

// Records API
export const RecordsAPI = {
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters);
        return API.get(`/records?${params}`);
    },

    async getById(recordId) {
        return API.get(`/records/${recordId}`);
    }
};
