import axios from 'axios';

const API_URL = 'http://localhost:8000/api/pagos';

export const createMercadoPagoPreference = async (paymentData) => {
    console.log("DEBUG: Enviando datos de pago:", paymentData);
    try {
        const response = await axios.post(`${API_URL}/mercadopago`, paymentData);
        console.log("DEBUG: Respuesta del backend:", response.data);
        return response.data.preference;
    } catch (error) {
        console.error('Error al crear la preferencia de MercadoPago:', error);
        throw error;
    }
};
