import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/productos/";
const API_IMG = "http://127.0.0.1:8000"

export const getProductos = async (query = "") => {
  try {
    const response = await axios.get(`${API_URL}${query}`);
    return response.data.map((producto) => ({
      ...producto,
      image_url: producto.image_url ? `${API_IMG}${producto.image_url}` : null,
    }));
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    throw error;
  }
};


export const addProduct = async (product) => {
  const formData = new FormData();
  formData.append("nombre", product.nombre);
  formData.append("descripcion", product.descripcion);
  formData.append("precio", product.precio);
  formData.append("cantidad", product.cantidad);
  formData.append("categoria_id", product.categoria_id);
  if (product.image_url) formData.append("image", product.image_url);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

