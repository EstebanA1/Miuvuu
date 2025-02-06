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
    const [productImage, setProductImage] = useState(null);
    const [editedImageBlob, setEditedImageBlob] = useState(null);
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(product.image_url);
    const fileInputRef = useRef(null);
    const [categories, setCategories] = useState([]);

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
        return () => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            if (editedImageBlob) {
                URL.revokeObjectURL(URL.createObjectURL(editedImageBlob));
            }
        };
    }, [imagePreviewUrl, editedImageBlob]);

    const changeImage = () => {
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setProductImage(null);
        setEditedImageBlob(null);
        setImagePreviewUrl(null);
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

            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviewUrl);
            }

            const newImageUrl = URL.createObjectURL(file);
            setProductImage(file);
            setImagePreviewUrl(newImageUrl);
            setEditedImageBlob(null);
        }
        e.target.value = null;
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

        if (editedImageBlob) {
            formData.append("image", editedImageBlob);
        }

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

                        <div className="image-upload-section">
                            {!imagePreviewUrl && (
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
                                            sx={{
                                                backgroundColor: '#1976d2',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0'
                                                }
                                            }}
                                        >
                                            Seleccionar imagen
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {imagePreviewUrl && (
                                <div className="form-image-preview">
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Vista previa"
                                        onClick={() => setShowImageEditor(true)}
                                    />
                                    <div className="img-btn">
                                        <Button
                                            variant="contained"
                                            onClick={() => setShowImageEditor(true)}
                                            sx={{ mr: 1 }}
                                        >
                                            Modificar
                                        </Button>

                                        <Button
                                            variant="contained"
                                            onClick={changeImage}
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
                                startIcon={<CloseIcon />}
                                onClick={onCancel}
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

                {showImageEditor && (
                    <ImageEditor
                        image={editedImageBlob || productImage || imagePreviewUrl}
                        setImage={(file) => {
                            if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(imagePreviewUrl);
                            }
                            const newImageUrl = URL.createObjectURL(file);
                            setEditedImageBlob(file);
                            setImagePreviewUrl(newImageUrl);
                        }}
                        setImageEdited={true}
                        onClose={() => setShowImageEditor(false)}
                    />
                )}

            </div>
        </div>
    );
};

export default EditProductForm;