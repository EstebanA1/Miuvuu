import './AddProductForm.css';
import React, { useState, useEffect, useRef } from 'react';
import ImageEditor from '../ImageEditor/ImageEditor';
import { addProduct } from '../../../services/productos';
import { getCategorias } from '../../../services/categorias';
import { Autocomplete, TextField, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const AddProductForm = ({ closeModal }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [editedImageBlob, setEditedImageBlob] = useState(null);

  const [categories, setCategories] = useState([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const fileInputRef = useRef(null);

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

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        alert("Formato de imagen no soportado. Solo se permiten PNG, JPG, JPEG y WEBP.");
        return;
      }

      if (productImage) {
        URL.revokeObjectURL(URL.createObjectURL(productImage));
      }

      setProductImage(file);
      setEditedImageBlob(null);
      setShowImageEditor(false);
    }

    e.target.value = null;
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setProductImage(null);
    setEditedImageBlob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productQuantity ||
      !productCategory ||
      (!productImage && !editedImageBlob)
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const selectedCategory = categories.find(
      (cat) => `${cat.genero}-${cat.nombre}` === productCategory
    );

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

    console.log("Datos del producto:", productData);

    try {
      const response = await addProduct(productData);
      console.log("Respuesta del servidor:", response);

      if (response.image_url) {
        alert("Producto creado exitosamente.");
        resetForm();
        closeModal();
      } else {
        alert("Hubo un problema al crear el producto.");
      }
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      alert("Hubo un error al agregar el producto.");
    }
  };


  return (
    <div className="modal">
      <div className="modal-addProduct-content">
        <h2 className='title-form'>Agregar Producto</h2>

        <div className="modal-body add-product-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    <Button
                      variant="contained"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar imagen
                    </Button>
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
                    <Button
                      variant="contained"
                      onClick={() => setShowImageEditor(true)}
                      sx={{
                        backgroundColor: '#BD7B4D',
                        marginRight: 1,
                        '&:hover': {
                          backgroundColor: '#a66b43'
                        }
                      }}
                    >
                      Modificar
                    </Button>

                    <Button
                      variant="contained"
                      onClick={changeImage}
                      sx={{
                        backgroundColor: '#BD7B4D',
                        '&:hover': {
                          backgroundColor: '#a66b43'
                        }
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-buttons">
              <Button
                variant="contained"
                color="error"
                onClick={closeModal}
                startIcon={<CloseIcon />}
                sx={{
                  '&:hover': {
                    backgroundColor: '#b71c1c',
                  }
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="outlined"
                type="submit"
                endIcon={<SaveIcon />}
                sx={{
                  color: 'success.main',
                  borderColor: 'success.main',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 125, 50, 0.04)',
                    borderColor: '#2e7d32',
                    color: '#2e7d32'
                  }
                }}
              >
                Subir Producto
              </Button>
            </div>
          </form>
        </div>

        {showImageEditor && (
          <ImageEditor
            image={editedImageBlob || productImage}
            setImage={(file) => {
              setEditedImageBlob(file);
              setProductImage(file);
            }}
            setImageEdited={true}
            onClose={() => setShowImageEditor(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AddProductForm;
