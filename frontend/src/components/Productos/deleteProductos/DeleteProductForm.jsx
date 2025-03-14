import React from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import "./DeleteProductForm.css";
import { deleteProduct } from "../../../services/productos";
import CloseIcon from "@mui/icons-material/Close";

const DeleteProductForm = ({ productName, productId, onCancel, onProductDeleted }) => {
    const handleDelete = async () => {
        try {
            await deleteProduct(productId);
            alert(`Producto ${productName} eliminado exitosamente`);
            onProductDeleted();
        } catch (error) {
            const errorMessage = error.detail || error.message || "Error desconocido al eliminar el producto";
            alert(`Error: ${errorMessage}`);
            console.error("Error detallado:", error);
        }
    };

    return (
        <div className="delete-product-overlay">
            <div className="delete-product-modal">
                <h2>¿Seguro que quieres eliminar el producto?</h2>
                <p>
                    El producto <strong>{productName}</strong> será eliminado
                    permanentemente.
                </p>
                <div className="delete-product-buttons">
                    <Button 
                        variant="outlined" 
                        startIcon={<CloseIcon />}
                        onClick={onCancel}
                        sx={{ 
                            mr: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                borderColor: '#1976d2' 
                            }
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button 
                        variant="contained" 
                        color="error" 
                        endIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{
                            '&:hover': {
                                backgroundColor: '#b91c1c'
                            }
                        }}
                    >
                        Sí, eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductForm;