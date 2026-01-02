import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3001',
    ios: 'http://localhost:3001',
});

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
};

export default client;
