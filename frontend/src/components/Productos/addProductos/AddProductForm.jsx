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

  const [selectedImages, setSelectedImages] = useState([]);
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
      selectedImages.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
      if (editedImageBlob) {
        URL.revokeObjectURL(URL.createObjectURL(editedImageBlob));
      }
    };
  }, [selectedImages, editedImageBlob]);

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      for (const file of files) {
        if (!validFormats.includes(file.type)) {
          alert("Formato de imagen no soportado. Solo se permiten PNG, JPG, JPEG y WEBP.");
          return;
        }
      }
      setSelectedImages(files);
      setEditedImageBlob(null);
      setShowImageEditor(false);
    }
    e.target.value = null;
  };

  const changeImage = () => {
    setSelectedImages([]);
    setEditedImageBlob(null);
    setShowImageEditor(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
      }
    }, 0);
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setSelectedImages([]);
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
      selectedImages.length === 0
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const selectedCat = categories.find(
      (cat) => `${cat.genero}-${cat.nombre}` === productCategory
    );
    if (!selectedCat) {
      alert("La categoría seleccionada no existe. Por favor, verifica.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", productName);
    formData.append("descripcion", productDescription);
    formData.append("precio", productPrice);
    formData.append("cantidad", productQuantity);
    formData.append("categoria_id", selectedCat.id);

    formData.append("image", editedImageBlob || selectedImages[0]);

    if (selectedImages.length > 1) {
      selectedImages.slice(1).forEach((file) => {
        formData.append("additional_images", file);
      });
    }

    try {
      const response = await addProduct(formData);
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
        <h2 className="title-form">Agregar Producto</h2>

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
                sx={{ marginTop: "5px", marginBottom: "5px" }}
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
                sx={{ marginTop: "5px", marginBottom: "5px" }}
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
                sx={{ marginTop: "5px", marginBottom: "5px" }}
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
                sx={{ marginTop: "5px", marginBottom: "5px" }}
              />
            </div>

            <div className="category">
              <Autocomplete
                options={categories.sort((a, b) => {
                  if (a.genero === b.genero) {
                    return a.nombre.localeCompare(b.nombre);
                  }
                  return a.genero === "Hombre" ? -1 : 1;
                })}
                getOptionLabel={(option) => `${option.genero}-${option.nombre}`}
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
              {selectedImages.length === 0 ? (
                <div>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      style={{ display: "none" }}
                    />
                    <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
                      Seleccionar imagenes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="form-image-preview">
                  <img
                    src={URL.createObjectURL(editedImageBlob || selectedImages[0])}
                    alt="Vista previa"
                    onClick={() => setShowImageEditor(true)}
                  />
                  {selectedImages.length > 1 &&
                    selectedImages.slice(1).map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`Adicional ${idx + 1}`}
                      />
                    ))}
                  <div className="img-btn">
                    <Button
                      variant="contained"
                      onClick={() => setShowImageEditor(true)}
                      sx={{
                        marginRight: 1,
                        "&:hover": { backgroundColor: "#a66b43" },
                      }}
                    >
                      Modificar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={changeImage}
                      sx={{
                        "&:hover": { backgroundColor: "#a66b43" },
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
                  "&:hover": { backgroundColor: "#b71c1c" },
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="outlined"
                type="submit"
                endIcon={<SaveIcon />}
                sx={{
                  color: "success.main",
                  borderColor: "success.main",
                  "&:hover": {
                    backgroundColor: "rgba(46, 125, 50, 0.04)",
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                  },
                }}
              >
                Subir Producto
              </Button>
            </div>
          </form>
        </div>

        {showImageEditor && (
          <ImageEditor
            image={editedImageBlob || selectedImages[0]}
            setImage={(file) => {
              setEditedImageBlob(file);
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
