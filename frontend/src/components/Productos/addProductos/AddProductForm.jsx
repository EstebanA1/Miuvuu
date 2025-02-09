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
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
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
      selectedImages.forEach(file => {
        if (file) {
          URL.revokeObjectURL(file.preview);
        }
      });
      if (editedImageBlob) {
        URL.revokeObjectURL(editedImageBlob.preview);
      }
    };
  }, [selectedImages, editedImageBlob]);

  const onFileChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        alert("Formato de imagen no soportado. Solo se permiten PNG, JPG, JPEG y WEBP.");
        return;
      }
      setSelectedImages((prev) => {
        if (prev.length < 6) {
          return [...prev, file];
        } else {
          alert("Se ha alcanzado el máximo de 6 imágenes.");
          return prev;
        }
      });
      setEditedImageBlob(null);
      setShowImageEditor(false);
    }
    e.target.value = null;
  };

  const handleSquareClick = (index) => {
    if (!selectedImages[index]) {
      setCurrentImageIndex(index);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      setCurrentImageIndex(index);
      setShowImageEditor(true);
    }
  };

  const handleDelete = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (index === 0 && editedImageBlob) {
      setEditedImageBlob(null);
    }
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

    const filledImages = selectedImages.filter(img => img instanceof File);
    if (filledImages.length === 0) {
      alert("No se han seleccionado imágenes válidas.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", productName);
    formData.append("descripcion", productDescription);
    formData.append("precio", productPrice);
    formData.append("cantidad", productQuantity);
    formData.append("categoria_id", selectedCat.id);

    formData.append("image", editedImageBlob || filledImages[0]);

    if (filledImages.length > 1) {
      filledImages.slice(1).forEach((file) => {
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
            <TextField
              label="Nombre del Producto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              sx={{ marginTop: "5px", marginBottom: "5px" }}
            />

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
              <div className="image-grid">
                {selectedImages.map((img, index) => (
                  <div
                    key={index}
                    className={`image-slot filled`}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setShowImageEditor(true);
                    }}
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Imagen ${index + 1}`}
                      className="slot-image"
                    />
                    <div
                      className="delete-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                    >
                      Eliminar
                    </div>
                  </div>
                ))}

                {Array.from({ length: 6 - selectedImages.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="image-slot"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <span className="slot-plus">+</span>
                  </div>
                ))}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: "none" }}
              />
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
            setImage={(file) => setEditedImageBlob(file)}
            setImageEdited={true}
            onClose={() => setShowImageEditor(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AddProductForm;
