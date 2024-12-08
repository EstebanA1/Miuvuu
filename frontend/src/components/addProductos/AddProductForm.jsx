import './AddProductForm.css';
import { addProduct } from '../../services/productos';
import { getCategorias } from '../../services/categorias';
import React, { useState, useEffect } from 'react';

const AddProductForm = ({ closeModal }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        const sortedCategories = data.sort((a, b) => {
          if (a.genero === b.genero) {
            return a.nombre.localeCompare(b.nombre);
          }
          return a.genero === 'Hombre' ? -1 : 1;
        });
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        alert("Hubo un problema al cargar las categorías.");
      }
    };
    fetchCategorias();
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !productDescription || !productPrice || !productQuantity || !productCategory || !productImage) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const selectedCategory = categories.find((cat) => cat.nombre === productCategory);
    if (!selectedCategory) {
      alert("La categoría seleccionada no existe. Por favor, verifica.");
      return;
    }

    const productData = {
      nombre: productName,
      descripcion: productDescription,
      precio: productPrice,
      cantidad: productQuantity,
      categoria_id: selectedCategory.id,
      image_url: productImage,
    };

    console.log("Datos enviados:", productData);

    try {
      const response = await addProduct(productData);
      alert(response.message);
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductQuantity("");
      setProductCategory("");
      setProductImage(null);
      closeModal();
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      alert("Hubo un error al agregar el producto.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Agregar Producto</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>Nombre del Producto:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Descripción:</label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              required
              maxLength="500"
              rows="4"
            />
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Cantidad:</label>
            <input
              type="number"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Categoría:</label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              required
            >
              <option value="">Seleccionar Categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.genero}, {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Imagen:</label>
            <input type="file" onChange={onFileChange} accept="image/*" required />
          </div>
          <div>
            <button type="submit">Subir Producto</button>
            <button type="button" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
