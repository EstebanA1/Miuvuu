import axios from "axios";
import { API_URL } from "../config/config";

const BASE_URL = `${API_URL}/api/productos/`;
const API_BASE_URL = `${API_URL}`;


export const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (Array.isArray(imageUrl)) {
    imageUrl = imageUrl[0];
  }
  if (typeof imageUrl !== "string") return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  if (imageUrl.includes("/CarpetasDeProductos/")) {
    return encodeURI(`${API_BASE_URL}${imageUrl}`);
  } else {
    const parts = imageUrl.split("/");
    const filename = parts.pop();
    let folder;
    if (filename.includes("_")) {
      folder = filename.split("_")[0];
    } else {
      folder = filename.split(".")[0];
    }
    const newUrl = `/uploads/CarpetasDeProductos/${folder}/${filename}`;
    return encodeURI(`${API_BASE_URL}${newUrl}`);
  }
};

export const formatImageUrls = (imageUrls) => {
  if (!imageUrls) return [];
  let urls = imageUrls;
  if (typeof urls === "string") {
    urls = urls.trim();
    if (urls.startsWith('"[') && urls.endsWith(']"')) {
      urls = urls.substring(1, urls.length - 1);
    }
    urls = urls.replace(/""/g, '"');
    urls = urls.replace(/"\s*,\s*"/g, ',');
    urls = urls.replace(/^"+|"+$/g, '');
    try {
      const parsed = JSON.parse('[' + urls + ']');
      if (Array.isArray(parsed)) {
        urls = parsed;
      } else {
        urls = [urls];
      }
    } catch (e) {
      urls = urls.split(',').map(s => s.trim());
    }
  }
  return urls.map((url) => {
    if (url.startsWith("http")) return url;
    if (url.includes("/CarpetasDeProductos/")) {
      return encodeURI(`${API_BASE_URL}${url}`);
    } else {
      const parts = url.split("/");
      const filename = parts.pop();
      let folder;
      if (filename.includes("_")) {
        folder = filename.split("_")[0];
      } else {
        folder = filename.split(".")[0];
      }
      const newUrl = `/uploads/CarpetasDeProductos/${folder}/${filename}`;
      return encodeURI(`${API_BASE_URL}${newUrl}`);
    }
  });
};

export const getProductos = async (query = "") => {
  try {
    const response = await axios.get(`${BASE_URL}${query}`);
    const { products, total } = response.data;
    const formattedProducts = (products || []).map((producto) => ({
      ...producto,
      image_url: Array.isArray(producto.image_url)
                  ? producto.image_url
                  : producto.image_url,
    }));
    
    return {
      products: formattedProducts,
      total: total || formattedProducts.length,
    };
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return { products: [], total: 0 };
  }
};

export const getProductoById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}${id}`);
    if (!response.data) {
      throw new Error("El producto no existe o no se pudo obtener.");
    }
    const product = response.data;
    
    if (Array.isArray(product.image_url)) {
      product.image_url = formatImageUrls(product.image_url);
    } else {
      product.image_url = [formatImageUrl(product.image_url)];
    }
    
    return product;
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    throw error.response?.data || error;
  }
};


export const addProduct = async (product) => {
  if (product instanceof FormData) {
    try {
      const response = await axios.post(BASE_URL, product, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
  
  const formData = new FormData();
  formData.append("nombre", product.nombre);
  formData.append("descripcion", product.descripcion);
  formData.append("precio", product.precio);
  formData.append("cantidad", product.cantidad);
  formData.append("categoria_id", product.categoria_id);
  if (product.image_url) formData.append("image", product.image_url);

  try {
    const response = await axios.post(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const editProduct = async (id, formData) => {
  try {
    const url = `${BASE_URL}${id}`;
    if (formData.get("precio")) {
      formData.set("precio", Number(formData.get("precio")));
    }
    if (formData.get("cantidad")) {
      formData.set("cantidad", Number(formData.get("cantidad")));
    }
    if (formData.get("categoria_id")) {
      formData.set("categoria_id", Number(formData.get("categoria_id")));
    }

    const response = await axios.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = response.data;
    if (data.image_url) {
      data.image_url = Array.isArray(data.image_url)
        ? formatImageUrls(data.image_url)
        : [formatImageUrl(data.image_url)];
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
    const response = await axios.delete(`${BASE_URL}${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    throw error.response?.data || error;
  }
};
