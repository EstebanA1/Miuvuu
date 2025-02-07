import './EditProductForm.css';
import React, { useState, useEffect, useRef } from "react";
import { TextField, Autocomplete } from "@mui/material";
import ImageEditor from '../ImageEditor/ImageEditor';
import { getCategorias } from '../../../services/categorias';
import { editProduct } from '../../../services/productos';
import Button from "@mui/material/Button";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const EditProductForm = ({ product, onUpdate, onCancel }) => {
    const [productName, setProductName] = useState(product.nombre);
    const [productDescription, setProductDescription] = useState(product.descripcion);
    const [productPrice, setProductPrice] = useState(product.precio);
    const [productQuantity, setProductQuantity] = useState(product.cantidad);
    const [productCategory, setProductCategory] = useState("");
    const [categories, setCategories] = useState([]);

    // Estado para manejar las imágenes:
    // Cada objeto tendrá: { previewUrl, file, editedBlob }
    const [images, setImages] = useState([]);
    // Referencia para el input file
    const fileInputRef = useRef(null);
    // currentImageIndex: si es null se agregará una imagen nueva; si es un número se modificará la imagen en ese índice
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [showImageEditor, setShowImageEditor] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategories(data);
                if (product.categoria_id && data.length > 0) {
                    const category = data.find(cat => cat.id === product.categoria_id);
                    if (category) {
                        setProductCategory(`${category.genero}-${category.nombre}`);
                    }
                }
            } catch (error) {
                alert("Hubo un problema al cargar las categorías.");
            }
        };
        fetchCategorias();
    }, [product.categoria_id]);

    // Inicializa el estado de imágenes con las que vienen del producto.
    useEffect(() => {
        if (product.image_url) {
            const initialImages = Array.isArray(product.image_url)
                ? product.image_url
                : [product.image_url];
            const imageObjs = initialImages.map(url => ({
                previewUrl: url,
                file: null,
                editedBlob: null
            }));
            setImages(imageObjs);
        }
    }, [product.image_url]);

    // Limpiar URLs de blob al desmontar o cuando se actualicen las imágenes
    useEffect(() => {
        return () => {
            images.forEach(imageObj => {
                if (imageObj.previewUrl && imageObj.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(imageObj.previewUrl);
                }
            });
        };
    }, [images]);

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!validFormats.includes(file.type)) {
                alert("Formato de imagen no soportado. Solo se permiten PNG, JPG, JPEG y WEBP.");
                return;
            }
            const newPreviewUrl = URL.createObjectURL(file);
            if (currentImageIndex === null) {
                // Agregar una nueva imagen
                setImages(prevImages => [
                    ...prevImages,
                    { previewUrl: newPreviewUrl, file: file, editedBlob: null }
                ]);
            } else {
                // Cambiar la imagen existente en la posición currentImageIndex
                setImages(prevImages => {
                    const newImages = [...prevImages];
                    if (newImages[currentImageIndex].previewUrl &&
                        newImages[currentImageIndex].previewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(newImages[currentImageIndex].previewUrl);
                    }
                    newImages[currentImageIndex] = { previewUrl: newPreviewUrl, file: file, editedBlob: null };
                    return newImages;
                });
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleEditImage = (index) => {
        setCurrentImageIndex(index);
        setShowImageEditor(true);
    };

    const handleChangeImage = (index) => {
        setCurrentImageIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAddImage = () => {
        setCurrentImageIndex(null);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageEdited = (editedFile) => {
        const newPreviewUrl = URL.createObjectURL(editedFile);
        setImages(prevImages => {
            const newImages = [...prevImages];
            newImages[currentImageIndex] = {
                ...newImages[currentImageIndex],
                previewUrl: newPreviewUrl,
                editedBlob: editedFile
            };
            return newImages;
        });
        setShowImageEditor(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !productDescription || !productPrice || !productQuantity || !productCategory) {
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

        const formData = new FormData();
        formData.append("nombre", productName.trim());
        formData.append("descripcion", productDescription.trim());
        formData.append("precio", Number(productPrice));
        formData.append("cantidad", Number(productQuantity));
        formData.append("categoria_id", Number(selectedCategory.id));

        // ---------------------------------------------------------
        // Envío de imágenes:
        //
        // 1. Se envían las imágenes nuevas o modificadas (con file o editedBlob).
        // 2. Se envían las imágenes existentes (que no fueron modificadas) en un campo extra.
        // ---------------------------------------------------------

        // Recopilar las imágenes que ya existen (sin file ni blob editado)
        const existingImageUrls = images
            .filter(img => !img.file && !img.editedBlob)
            .map(img => img.previewUrl);
        if (existingImageUrls.length > 0) {
            formData.append("existing_images", JSON.stringify(existingImageUrls));
        }

        // Recorrer el arreglo de imágenes y agregar las nuevas o modificadas
        images.forEach(imageObj => {
            if (imageObj.file || imageObj.editedBlob) {
                const fileToSend = imageObj.editedBlob || imageObj.file;
                const file = fileToSend instanceof File
                    ? fileToSend
                    : new File([fileToSend], "edited_image.webp", { type: fileToSend.type || "image/webp" });
                formData.append("image", file);
            }
        });

        try {
            const response = await editProduct(product.id, formData);
            if (response) {
                alert("Producto actualizado exitosamente.");
                onUpdate(response);
            }
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            if (error.response?.data?.detail?.detalles) {
                alert(error.response.data.detail.detalles);
            } else {
                alert("Hubo un error al actualizar el producto.");
            }
        }
    };

    return (
        <div className="modal">
            <div className="modal-editProduct-content">
                <div>
                    <h2 className="title-form">Editar Producto</h2>
                </div>
                <div className="modal-body add-product-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        {/* Campos de texto y categoría (sin cambios) */}
                        <div>
                            <TextField
                                label="Nombre del Producto"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
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
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
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
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
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
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="category">
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

                        {/* Sección de carga de imágenes */}
                        <div className="image-upload-section">
                            {/* Input file oculto */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                style={{ display: 'none' }}
                            />

                            {/* Mostrar las imágenes actuales */}
                            <div className="images-preview-container">
                                {images.map((imageObj, index) => (
                                    <div key={index} className="form-image-preview">
                                        <img
                                            src={imageObj.previewUrl}
                                            alt={`Vista previa ${index + 1}`}
                                            onClick={() => {
                                                setCurrentImageIndex(index);
                                                setShowImageEditor(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className="img-btn">
                                            <Button
                                                variant="contained"
                                                onClick={() => handleEditImage(index)}
                                                sx={{ mr: 1 }}
                                            >
                                                Modificar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleChangeImage(index)}
                                            >
                                                Cambiar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botón para añadir imagen nueva */}
                            <div className="add-image-button">
                                <Button variant="contained" onClick={handleAddImage}>
                                    Añadir imagen
                                </Button>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={onCancel}
                                sx={{
                                    '&:hover': { backgroundColor: '#b71c1c' }
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                color="success"
                                endIcon={<SaveIcon />}
                                type="submit"
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
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Editor de imagen: se muestra cuando se hace clic en "Modificar" o en la imagen */}
                {showImageEditor && currentImageIndex !== null && (
                    <ImageEditor
                        image={
                            images[currentImageIndex].editedBlob ||
                            images[currentImageIndex].file ||
                            images[currentImageIndex].previewUrl
                        }
                        setImage={(file) => handleImageEdited(file)}
                        setImageEdited={true}
                        onClose={() => setShowImageEditor(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default EditProductForm;
