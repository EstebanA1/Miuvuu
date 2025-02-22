import axios from 'axios';
import { API_URL } from "../config/config";

const BASE_URL = `${API_URL}/api`;

export const finalizarOrden = async (userId) => {
    const response = await axios.put(`${BASE_URL}/usuarios/${userId}/finalizar-orden`);
    return response.data;
};
