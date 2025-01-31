import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/productos/";
const API_BASE_URL = "http://127.0.0.1:8000";

const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
};

const formatProductData = (product) => {
  return {
    ...product,
    image_url: formatImageUrl(product.image_url)
  };
};

export const getProductos = async (query = "") => {
  try {
    const response = await axios.get(`${API_URL}${query}`);
    
    const { products, total } = response.data;
    
    const formattedProducts = (products || []).map(producto => ({
      ...producto,
      image_url: producto.image_url ? `${API_BASE_URL}${producto.image_url}` : null,
    }));

    return {
      products: formattedProducts,
      total: total || formattedProducts.length
    };

  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return { products: [], total: 0 }; 
  }
};

export const getProductoById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
    return formatProductData(response.data);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
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

export const editProduct = async (id, formData) => {
  try {
    const url = `${API_URL}${id}`;
    
    if (formData.get('precio')) {
      formData.set('precio', Number(formData.get('precio')));
    }
    if (formData.get('cantidad')) {
      formData.set('cantidad', Number(formData.get('cantidad')));
    }
    if (formData.get('categoria_id')) {
      formData.set('categoria_id', Number(formData.get('categoria_id')));
    }

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await axios.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = response.data;
    if (data.image_url) {
      data.image_url = `${API_BASE_URL}${data.image_url}`;
    }

    return data;
  } catch (error) {
    console.error("Error al editar el producto:", error);
    if (error.response?.data?.detail) {
      throw error.response.data;
    }
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    throw error.response?.data || error;
  }
};
