import React, { useState, useEffect } from 'react';
import { userService, authService } from '../../services/authService';
import { Card, CardContent } from '@mui/material';
import { TextField, Button, Alert } from '@mui/material';
import { Select, MenuItem, Checkbox } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import './myProfile.css';

const MyProfile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editedUser, setEditedUser] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (currentUser?.id) {
                const userData = await userService.getUser(currentUser.id);
                setUser(userData);
                setEditedUser(userData);
            }
        } catch (error) {
            setError('Error al cargar los datos del usuario');
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsModified(false);
        setError('');
        setPasswords({
            current: '',
            new: '',
            confirm: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
        setIsModified(true);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
        setIsModified(true);
    };

    const handleSave = async () => {
        try {
            if (passwords.new || passwords.confirm || passwords.current) {
                if (passwords.new !== passwords.confirm) {
                    setError('Las contraseñas nuevas no coinciden');
                    return;
                }
                // Aquí deberías agregar la lógica para cambiar la contraseña
                // await userService.changePassword(user.id, passwords);
            }

            const updatedUser = await userService.updateUser(user.id, editedUser);
            setUser(updatedUser);
            setIsModified(false);
            setPasswords({
                current: '',
                new: '',
                confirm: ''
            });
            setSuccess('Perfil actualizado exitosamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.message || 'Error al actualizar el perfil');
        }
    };

    if (!user) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="containerProfile">
            <Card className="max-w-2xl mx-auto">
                <CardContent>
                    {error && <Alert severity="error" className="mb-4">{error}</Alert>}
                    {success && <Alert severity="success" className="mb-4">{success}</Alert>}
                    <h2> Información de Usuario</h2>

                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={editedUser.nombre}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            label="Correo"
                            name="correo"
                            value={editedUser.correo}
                            onChange={handleChange}
                        />

                        <Select
                            className="input-field"
                            value={editedUser.metodo_pago || []}
                            onChange={handleChange}
                            name="metodo_pago"
                            multiple
                            renderValue={(selected) =>
                                selected.length > 0 ? selected.join(", ") : "Método de pago"
                            }
                            displayEmpty
                        >
                            <MenuItem disabled value="">
                                <em>Método de pago</em>
                            </MenuItem>
                            <MenuItem value="Tarjeta de crédito">
                                <Checkbox checked={editedUser.metodo_pago?.includes("Tarjeta de crédito")} />
                                Tarjeta de crédito
                            </MenuItem>
                            <MenuItem value="Tarjeta de débito">
                                <Checkbox checked={editedUser.metodo_pago?.includes("Tarjeta de débito")} />
                                Tarjeta de débito
                            </MenuItem>
                            <MenuItem value="Paypal">
                                <Checkbox checked={editedUser.metodo_pago?.includes("Paypal")} />
                                Paypal
                            </MenuItem>
                        </Select>

                        <TextField
                            fullWidth
                            type="password"
                            label="Contraseña Actual"
                            name="current"
                            value={passwords.current}
                            onChange={handlePasswordChange}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Nueva Contraseña"
                            name="new"
                            value={passwords.new}
                            onChange={handlePasswordChange}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirmar Nueva Contraseña"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handlePasswordChange}
                        />

                        <div className="cancelAndSaveChangesUserBTNS">
                            <Button
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={handleCancel}
                                disabled={!isModified}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                color="primary"
                                disabled={!isModified}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyProfile;