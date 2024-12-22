import './EditProductForm.css';
import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

const EditProductForm = ({ product, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        cantidad: product.cantidad,
        categoria_id: product.categoria_id,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...formData, id: product.id });
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
                    width: "80%",
                }}
            >
                <h2>Editar Producto</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Descripción"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Cantidad"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Categoría ID"
                        name="categoria_id"
                        value={formData.categoria_id}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        margin="normal"
                    />
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            style={{ marginRight: "10px" }}
                        >
                            Guardar Cambios
                        </Button>
                        <Button variant="outlined" onClick={onCancel}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductForm;
