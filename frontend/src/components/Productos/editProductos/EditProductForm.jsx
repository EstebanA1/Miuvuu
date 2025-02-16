import './EditProductForm.css';
import React, { useState, useEffect, useRef } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import ImageEditor from '../ImageEditor/ImageEditor';
import { getCategorias } from '../../../services/categorias';
import { editProduct, formatImageUrls } from '../../../services/productos';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const EditProductForm = ({ product, onUpdate, onCancel }) => {
    const [productName, setProductName] = useState(product.nombre);
    const [productDescription, setProductDescription] = useState(product.descripcion);
    const [productPrice, setProductPrice] = useState(product.precio);
    const [productQuantity, setProductQuantity] = useState(product.cantidad);
    const [productCategory, setProductCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const fileInputRef = useRef(null);
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

    useEffect(() => {
        if (product.image_url) {
            console.log("raw product.image_url:", product.image_url);
            let initialImages = [];
            if (Array.isArray(product.image_url)) {
                initialImages = formatImageUrls(product.image_url);
            } else if (typeof product.image_url === 'string') {
                try {
                    const parsed = JSON.parse(product.image_url);
                    initialImages = formatImageUrls(parsed);
                } catch (e) {
                    initialImages = formatImageUrls([product.image_url]);
                }
            }
            console.log("Initial images:", initialImages);
            const imageObjs = initialImages.map(url => ({
                previewUrl: url,
                file: null,
                editedBlob: null
            }));
            setImages(imageObjs);
        }
    }, [product.image_url]);


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

            if (selectedImageIndex !== null && selectedImageIndex < images.length) {
                setImages(prevImages => {
                    const newImages = [...prevImages];
                    if (newImages[selectedImageIndex].previewUrl?.startsWith('blob:')) {
                        URL.revokeObjectURL(newImages[selectedImageIndex].previewUrl);
                    }
                    newImages[selectedImageIndex] = { previewUrl: newPreviewUrl, file: file, editedBlob: null };
                    return newImages;
                });
            } else if (images.length < 6) {
                setImages(prevImages => [...prevImages, { previewUrl: newPreviewUrl, file: file, editedBlob: null }]);
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageAction = (action) => {
        if (selectedImageIndex === null) return;

        switch (action) {
            case 'edit':
                setShowImageEditor(true);
                break;
            case 'change':
                if (fileInputRef.current) {
                    fileInputRef.current.click();
                }
                break;
            case 'delete':
                setImages(prevImages => {
                    const newImages = [...prevImages];
                    if (newImages[selectedImageIndex].previewUrl?.startsWith('blob:')) {
                        URL.revokeObjectURL(newImages[selectedImageIndex].previewUrl);
                    }
                    newImages.splice(selectedImageIndex, 1);
                    return newImages;
                });
                setSelectedImageIndex(null);
                break;
            default:
                break;
        }
    };

    const handleImageEdited = (editedFile) => {
        const newPreviewUrl = URL.createObjectURL(editedFile);
        setImages(prevImages => {
            const newImages = [...prevImages];
            newImages[selectedImageIndex] = {
                ...newImages[selectedImageIndex],
                previewUrl: newPreviewUrl,
                editedBlob: editedFile
            };
            return newImages;
        });
        setShowImageEditor(false);
    };

    const handleImageSelect = (index) => {
        setSelectedImageIndex(selectedImageIndex === index ? null : index);
    };

    const handleAddImage = () => {
        if (images.length < 6) {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }
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

        const existingImageUrls = images
            .filter(img => !img.file && !img.editedBlob)
            .map(img => img.previewUrl);

        console.log("existingImageUrls:", existingImageUrls); // Ver qué contiene

        formData.append("existing_images", JSON.stringify(existingImageUrls));

        images.forEach(imageObj => {
            if (imageObj.file || imageObj.editedBlob) {
                const fileToSend = imageObj.editedBlob || imageObj.file;
                if (fileToSend) {
                    formData.append("images", fileToSend);
                }
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
                <h2 className="title-form">Editar Producto</h2>
                <div className="add-product-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <TextField
                            label="Nombre del Producto"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            sx={{ marginTop: '5px', marginBottom: '5px' }}
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
                            sx={{ marginTop: '5px', marginBottom: '5px' }}
                        />

                        <TextField
                            label="Precio"
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            sx={{ marginTop: '5px', marginBottom: '5px' }}
                        />

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

                        <div className="category">
                            <Autocomplete
                                options={categories.sort((a, b) => {
                                    if (a.genero === b.genero) {
                                        return a.nombre.localeCompare(b.nombre);
                                    }
                                    return a.genero === 'Hombre' ? -1 : 1;
                                })}
                                getOptionLabel={(option) => `${option.genero}-${option.nombre}`}
                                value={categories.find(
                                    (cat) => `${cat.genero}-${cat.nombre}` === productCategory
                                ) || null}
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

                        <div className="image-section">
                            <div className="image-grid">
                                {images.map((imageObj, index) => (
                                    <div
                                        key={index}
                                        className={`image-slot filled ${selectedImageIndex === index ? 'selected' : ''}`}
                                        onClick={() => handleImageSelect(index)}
                                    >
                                        <img
                                            src={imageObj.previewUrl}
                                            alt={`Imagen ${index + 1}`}
                                            className="slot-image"
                                        />
                                    </div>
                                ))}

                                {Array.from({ length: 6 - images.length }).map((_, idx) => (
                                    <div
                                        key={`empty-${idx}`}
                                        className="image-slot"
                                        onClick={handleAddImage}
                                    >
                                        <span className="slot-plus">+</span>
                                    </div>
                                ))}
                            </div>

                            <div className="image-actions-panel">
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={selectedImageIndex === null}
                                    onClick={() => handleImageAction('edit')}
                                    startIcon={<EditIcon />}
                                >
                                    Modificar
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={selectedImageIndex === null}
                                    onClick={() => handleImageAction('change')}
                                    startIcon={<AddPhotoAlternateIcon />}
                                >
                                    Cambiar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    disabled={selectedImageIndex === null}
                                    onClick={() => handleImageAction('delete')}
                                    startIcon={<DeleteIcon />}
                                >
                                    Eliminar
                                </Button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="form-buttons">
                            <Button
                                variant="contained"
                                color="error"
                                onClick={onCancel}
                                startIcon={<CloseIcon />}
                                sx={{
                                    '&:hover': { backgroundColor: '#b71c1c' }
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
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>

                {showImageEditor && selectedImageIndex !== null && (
                    <ImageEditor
                        image={
                            images[selectedImageIndex].editedBlob ||
                            images[selectedImageIndex].file ||
                            images[selectedImageIndex].previewUrl
                        }
                        setImage={handleImageEdited}
                        setImageEdited={true}
                        onClose={() => setShowImageEditor(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default EditProductForm;