// AddUserModal.jsx
import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { userService } from '../../../services/authService';
import './AddUserModal.css';

const AddUserModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: 'usuario'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await userService.createUser({
                nombre: formData.nombre,
                correo: formData.email,
                contraseña: formData.password,
                rol: formData.rol
            });

            setSuccess('Usuario creado exitosamente');
            setTimeout(() => {
                onAdd();
                onClose();
            }, 1500);
        } catch (error) {
            if (error.detail?.includes('usuarios_correo_key')) {
                setError('Este correo electrónico ya está registrado');
            } else {
                setError(error.message || 'Error al crear usuario');
            }
        }
    };

    return (
        <div className="modal">
            <div className="modal-addUser-content">
                <h2 className="title-form">Añadir Nuevo Usuario</h2>
                
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <div>
                            <TextField
                                fullWidth
                                name="nombre"
                                label="Nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                variant="outlined"
                                margin="normal"
                                required
                                sx={{
                                    marginTop: '5px',
                                    marginBottom: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <TextField
                                fullWidth
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                margin="normal"
                                required
                                sx={{
                                    marginTop: '5px',
                                    marginBottom: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <TextField
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                margin="normal"
                                required
                                sx={{
                                    marginTop: '5px',
                                    marginBottom: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <TextField
                                fullWidth
                                name="confirmPassword"
                                label="Confirmar Contraseña"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                variant="outlined"
                                margin="normal"
                                required
                                sx={{
                                    marginTop: '5px',
                                    marginBottom: '5px'
                                }}
                            />
                        </div>

                        <div className="select-role">
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    label="Rol"
                                >
                                    <MenuItem value="usuario">Usuario</MenuItem>
                                    <MenuItem value="vendedor">Vendedor</MenuItem>
                                    <MenuItem value="admin">Administrador</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className="form-buttons">
                            <Button
                                variant="contained"
                                color="error"
                                onClick={onClose}
                                startIcon={<CloseIcon />}
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
                                Crear Usuario
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;