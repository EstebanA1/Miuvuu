import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const finalizarOrden = async (userId) => {
    const response = await axios.put(`${API_URL}/usuarios/${userId}/finalizar-orden`);
    return response.data;
};
