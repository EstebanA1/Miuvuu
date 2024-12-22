import React from "react";
import { Button } from "@mui/material";
import { deleteProduct } from "../../../services/productos";

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
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center",
                }}
            >
                <h2>¿Seguro que quieres eliminar el producto?</h2>
                <p>
                    El producto <strong>{productName}</strong> será eliminado
                    permanentemente.
                </p>
                <div style={{ marginTop: "20px" }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDelete}
                        style={{ marginRight: "10px" }}
                    >
                        Sí, eliminar
                    </Button>
                    <Button variant="outlined" onClick={onCancel}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProductForm;
