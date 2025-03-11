import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { userService } from '../../../services/authService';
import './EditUserModal.css';
import { Eye, EyeOff } from 'lucide-react';
import { IconButton, InputAdornment } from '@mui/material';

const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [userData, setUserData] = useState({
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        metodo_pago: user.metodo_pago || []
    });
    
    const [passwords, setPasswords] = useState({
        nueva: '',
        confirmar: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        nueva: false,
        confirmar: false
    });
    
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData.nombre || !userData.correo || !userData.rol) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        const dataToUpdate = {
            nombre: userData.nombre,
            correo: userData.correo,
            rol: userData.rol,
            metodo_pago: userData.metodo_pago
        };

        if (passwords.nueva || passwords.confirmar) {
            if (!passwords.nueva || !passwords.confirmar) {
                alert("Debe completar ambos campos de contraseña");
                return;
            }
            
            if (passwords.nueva !== passwords.confirmar) {
                alert("Las contraseñas no coinciden");
                return;
            }
            
            dataToUpdate.current_password = null;
            dataToUpdate.nueva_contraseña = passwords.nueva;
            dataToUpdate.confirmar_nueva_contraseña = passwords.confirmar;
        }

        try {
            await userService.updateUser(user.id, dataToUpdate);
            alert("Usuario actualizado exitosamente.");
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            const errorMessage = error.response?.data?.detail?.detalles ||
                error.response?.data?.detail ||
                "Hubo un error al actualizar el usuario.";
            alert(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="modal">
            <div className="modal-editUser-content">
                <div>
                    <h2 className="title-form">Editar Usuario</h2>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <TextField
                                label="Nombre"
                                value={userData.nombre}
                                onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                                fullWidth
                                aria-label="Nombre"
                                variant="outlined"
                                margin="normal"
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
                            />
                        </div>

                        <div>
                            <TextField
                                label="Correo Electrónico"
                                type="email"
                                aria-label="Correo electrónico"
                                value={userData.correo}
                                onChange={(e) => setUserData({ ...userData, correo: e.target.value })}
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
                            />
                        </div>

                        <div className="role-select">
                            <FormControl fullWidth variant="outlined" margin="normal">
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    value={userData.rol}
                                    onChange={(e) => setUserData({ ...userData, rol: e.target.value })}
                                    label="Rol"
                                >
                                    <MenuItem value="usuario">Usuario</MenuItem>
                                    <MenuItem value="vendedor">Vendedor</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div>
                            <TextField
                                label="Nueva Contraseña"
                                type={showPasswords.nueva ? "text" : "password"}
                                value={passwords.nueva}
                                onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
                                fullWidth
                                aria-label="Nueva contraseña"
                                variant="outlined"
                                margin="normal"
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
                                helperText="Deja en blanco para mantener la contraseña actual"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => togglePasswordVisibility('nueva')}>
                                                {showPasswords.nueva ? <EyeOff /> : <Eye />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        
                        <div>
                            <TextField
                                label="Confirmar Nueva Contraseña"
                                type={showPasswords.confirmar ? "text" : "password"}
                                value={passwords.confirmar}
                                onChange={(e) => setPasswords({ ...passwords, confirmar: e.target.value })}
                                fullWidth
                                aria-label="Confirmar nueva contraseña"
                                variant="outlined"
                                margin="normal"
                                sx={{ marginTop: '5px', marginBottom: '5px' }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => togglePasswordVisibility('confirmar')}>
                                                {showPasswords.confirmar ? <EyeOff /> : <Eye />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div className="form-buttons">
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={onClose}
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
            </div>
        </div>
    );
};

export default EditUserModal;
