import axios from "axios";
import { API_URL } from "../config/config";

const BASE_URL = `${API_URL}/api/categorias/`;

export const getCategorias = async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      throw error;
    }
  };