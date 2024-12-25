import React from "react";
import { Button } from "@mui/material";
import { deleteProduct } from "../../../services/productos";
import "./DeleteProductForm.css";

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
                    <Button variant="outlined" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDelete}
                        className="delete-product-confirm"
                    >
                        Sí, eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductForm;