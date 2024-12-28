// DeleteUserModal.jsx
import React from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { userService } from "../../../services/authService";
import "./DeleteUserModal.css";

const DeleteUserModal = ({ user, onClose, onDelete }) => {
    const handleDelete = async () => {
        try {
            await userService.deleteUser(user.id);
            alert(`Usuario ${user.nombre} eliminado exitosamente`);
            onDelete();
            onClose();
        } catch (error) {
            const errorMessage = error.detail || error.message || "Error desconocido al eliminar el usuario";
            alert(`Error: ${errorMessage}`);
            console.error("Error detallado:", error);
        }
    };

    return (
        <div className="delete-user-overlay">
            <div className="delete-user-modal">
                <h2>¿Seguro que quieres eliminar el usuario?</h2>
                <p>
                    El usuario <strong>{user.nombre}</strong> será eliminado
                    permanentemente.
                </p>
                <div className="delete-user-buttons">
                    <Button 
                        variant="outlined" 
                        startIcon={<CloseIcon />}
                        onClick={onClose}
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

export default DeleteUserModal;