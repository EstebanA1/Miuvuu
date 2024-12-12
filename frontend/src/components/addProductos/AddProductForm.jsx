import './AddProductForm.css';
import React, { useState, useEffect, useRef } from 'react';
import ImageEditor from '../ImageEditor/ImageEditor';
import { addProduct } from '../../services/productos';
import { Autocomplete, TextField } from '@mui/material';
import { getCategorias } from '../../services/categorias';

const AddProductForm = ({ closeModal }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [editedImageBlob, setEditedImageBlob] = useState(null);

  // Estados secundarios (estados de configuración o control)
  const [categories, setCategories] = useState([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const fileInputRef = useRef(null);

  // Obtener categorías al cargar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategories(data);
      } catch (error) {
        alert("Hubo un problema al cargar las categorías.");
      }
    };
    fetchCategorias();
  }, []);

  // Limpiar URLs de objetos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (productImage) {
        URL.revokeObjectURL(URL.createObjectURL(productImage));
      }
      if (editedImageBlob) {
        URL.revokeObjectURL(URL.createObjectURL(editedImageBlob));
      }
    };
  }, [productImage, editedImageBlob]);

  // Cambiar imagen (resetear la imagen actual y abrir selector)
  const changeImage = () => {
    setProductImage(null);
    setEditedImageBlob(null);
    setShowImageEditor(false);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
      }
    }, 0);
  };

  // Manejar cambio de archivo seleccionado
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        alert("Formato de imagen no soportado. Solo se permiten PNG, JPG, JPEG y WEBP.");
        return;
      }

      // Revocar la URL anterior si existe
      if (productImage) {
        URL.revokeObjectURL(URL.createObjectURL(productImage));
      }

      setProductImage(file);
      setEditedImageBlob(null);
      setShowImageEditor(false); 
    }

    e.target.value = null;
  };

  // Resetear todos los campos del formulario
  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setProductImage(null);
    setEditedImageBlob(null);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !productDescription || !productPrice || !productQuantity || !productCategory || (!productImage && !editedImageBlob)) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const [selectedGenero, selectedNombre] = productCategory.split('-');
    const selectedCategory = categories.find(
      (cat) => cat.genero === selectedGenero && cat.nombre === selectedNombre
    );

    if (!selectedCategory) {
      alert("La categoría seleccionada no existe. Por favor, verifica.");
      return;
    }

    const productData = new FormData();
    productData.append("nombre", productName);
    productData.append("descripcion", productDescription);
    productData.append("precio", productPrice);
    productData.append("cantidad", productQuantity);
    productData.append("categoria_id", selectedCategory.id);
    productData.append("image", editedImageBlob || productImage);

    try {
      const response = await addProduct(productData);
      alert(response.message);
      resetForm();
      closeModal();
    } catch (error) {
      alert("Hubo un error al agregar el producto.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className='title-form'>Agregar Producto</h2>

        {/* Nuevo div de modal-body */}
        <div className="modal-body add-product-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Nombre del producto */}
            <div>
              <TextField
                label="Nombre del Producto"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={{
                  marginTop: '5px',
                  marginBottom: '5px'
                }}
              />
            </div>

            {/* Descripción */}
            <div>
              <TextField
                label="Descripción"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                margin="normal"
                helperText={`${productDescription.length}/500`}
                sx={{
                  marginTop: '5px',
                  marginBottom: '5px'
                }}
              />
            </div>

            {/* Precio */}
            <div>
              <TextField
                label="Precio USD"
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={{
                  marginTop: '5px',
                  marginBottom: '5px'
                }}
              />
            </div>

            {/* Cantidad */}
            <div>
              <TextField
                label="Cantidad"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                fullWidth
                variant="outlined"
                margin="normal"
                sx={{
                  marginTop: '5px',
                  marginBottom: '5px'
                }}
              />
            </div>

            {/* Categoría */}
            <div className='category'>
              <Autocomplete
                options={categories.sort((a, b) => {
                  if (a.genero === b.genero) {
                    return a.nombre.localeCompare(b.nombre);
                  }
                  return a.genero === 'Hombre' ? -1 : 1;
                })}
                getOptionLabel={(option) => `${option.genero}, ${option.nombre}`}
                value={
                  categories.find(
                    (cat) => `${cat.genero}-${cat.nombre}` === productCategory
                  ) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    setProductCategory(`${newValue.genero}-${newValue.nombre}`);
                  } else {
                    setProductCategory("");
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Seleccionar Categoría" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.genero === value.genero && option.nombre === value.nombre
                }
              />
            </div>

            {/* Sección de imagen con nuevo div */}
            <div className="image-upload-section">
              {!productImage && (
                <div>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="select-image-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar imagen
                    </button>
                  </div>
                </div>
              )}

              {productImage && (
                <div className="form-image-preview">
                  <img
                    src={URL.createObjectURL(editedImageBlob || productImage)}
                    alt="Vista previa"
                    onClick={() => setShowImageEditor(true)}
                  />
                  <div className="img-btn">
                    <button
                      type="button"
                      className="modify-image-btn"
                      onClick={() => setShowImageEditor(true)}
                    >
                      Modificar
                    </button>

                    <button
                      type="button"
                      className="change-image-btn"
                      onClick={changeImage}
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}


            </div>

            <div className="form-buttons">
              <button type="button" onClick={closeModal}>
                Cerrar
              </button>
              <button type="submit">Subir Producto</button>
            </div>
          </form>
        </div >

        {/* Editor de imágenes */}
        {
          showImageEditor && (
            <ImageEditor
              image={editedImageBlob || productImage}
              setImage={(file) => {
                setEditedImageBlob(file);
                setProductImage(file);
              }}
              setImageEdited={true}
              onClose={() => setShowImageEditor(false)}
            />
          )
        }
      </div >
    </div >
  );
};

export default AddProductForm;
