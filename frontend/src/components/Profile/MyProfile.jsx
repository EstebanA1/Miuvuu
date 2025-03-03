import React, { useState, useEffect } from 'react';
import { userService, authService } from '../../services/authService';
import { Card, CardContent } from '@mui/material';
import { TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import { Select, MenuItem, Checkbox } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Eye, EyeOff } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editedUser, setEditedUser] = useState({});
    const [isModified, setIsModified] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (currentUser?.id) {
                const userData = await userService.getUser(currentUser.id);
                userData.favoritos = userData.favoritos || [];
                userData.carrito = userData.carrito || [];
                userData.metodo_pago = userData.metodo_pago || [];
                setUser(userData);
                setEditedUser(userData);
            }
        } catch (error) {
            setError('Error al cargar los datos del usuario');
            console.error('Error:', error);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
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
            const payload = {
                nombre: editedUser.nombre,
                correo: editedUser.correo,
                metodo_pago: editedUser.metodo_pago,
                rol: editedUser.rol
            };

            if (passwords.current || passwords.new || passwords.confirm) {
                if (passwords.new !== passwords.confirm) {
                    setError('Las contraseñas nuevas no coinciden');
                    return;
                }
                payload.current_password = passwords.current;
                payload.nueva_contraseña = passwords.new;
                payload.confirmar_nueva_contraseña = passwords.confirm;
            }

            const updatedUser = await userService.updateUser(user.id, payload);
            setUser(updatedUser);
            setEditedUser(updatedUser);
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
            <Card className="max-w-2xl mx-auto" sx={{ backgroundColor: '#f9f9f9'}}>
                <CardContent>
                    {error && <Alert severity="error" className="mb-4">{error}</Alert>}
                    {success && <Alert severity="success" className="mb-4">{success}</Alert>}
                    <h2>Información de Usuario</h2>

                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={editedUser.nombre || ''}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            label="Correo"
                            name="correo"
                            value={editedUser.correo || ''}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Rol"
                            name="rol"
                            value={editedUser.rol || ''}
                            onChange={handleChange}
                            disabled={user.rol !== 'admin'}
                            helperText={user.rol !== 'admin' ? 'Solo un admin puede modificar el rol' : ''}
                        >
                            {['admin', 'vendedor', 'usuario'].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>

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
                            type={showPasswords.current ? "text" : "password"}
                            label="Contraseña Actual"
                            name="current"
                            value={passwords.current}
                            onChange={handlePasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('current')}
                                            edge="end"
                                        >
                                            {showPasswords.current ? <EyeOff /> : <Eye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPasswords.new ? "text" : "password"}
                            label="Nueva Contraseña"
                            name="new"
                            value={passwords.new}
                            onChange={handlePasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('new')}
                                            edge="end"
                                        >
                                            {showPasswords.new ? <EyeOff /> : <Eye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPasswords.confirm ? "text" : "password"}
                            label="Confirmar Nueva Contraseña"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handlePasswordChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            edge="end"
                                        >
                                            {showPasswords.confirm ? <EyeOff /> : <Eye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <div className="cancelAndSaveChangesUserBTNS">
                            <Button
                                variant="contained"
                                startIcon={<CancelIcon />}
                                color='error'
                                onClick={handleCancel}
                                disabled={!isModified}
                                sx={{
                                    '&:hover': { backgroundColor: '#b71c1c' }
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                endIcon={<SaveIcon />}
                                onClick={handleSave}
                                color="primary"
                                disabled={!isModified}
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyProfile;