import React, { useState } from 'react';
import { authService } from '../../services/authService';
import './AuthModal.css';

const AuthModal = ({ open, onClose }) => {
    const [isActive, setIsActive] = useState(false);
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        email: '',
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

    const handleOverlayClick = (e) => {
        if (e.target.className === 'modal-overlay') {
            onClose();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await authService.login({
                emailOrUsername: formData.emailOrUsername,
                password: formData.password,
            });

            setSuccess('¡Inicio de sesión exitoso!');
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1500);
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await authService.register({
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
            });

            setSuccess('¡Registro exitoso! Ya puedes iniciar sesión');
            setTimeout(() => {
                setIsActive(false);
                setFormData({
                    emailOrUsername: '',
                    password: '',
                    confirmPassword: '',
                    nombre: '',
                    email: '',
                });
            }, 1500);
        } catch (error) {
            if (error.detail && error.detail.includes('usuarios_correo_key')) {
                setError('Este correo electrónico ya está registrado, utilizar otro.');
            } else {
                setError(error.message || 'Error al registrarse');
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`container ${isActive ? 'active' : ''}`}>
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister}>
                        <h1>Crear Cuenta</h1>
                        <div className="social-icons">
                            <button type="button" className="google-button">
                                <img src="/google.svg" alt="Google Icon" className="google-icon" />
                                Continuar con Google
                            </button>
                        </div>
                        <span>o usa tu email para registrarte</span>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <input
                            type="text"
                            placeholder="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <input
                            type="password"
                            placeholder="Confirmar Contraseña"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <button type="submit">Registrarse</button>
                    </form>
                </div>

                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Iniciar Sesión</h1>
                        <div className="social-icons">
                            <button type="button" className="google-button">
                                <img src="/google.svg" alt="Google Icon" className="google-icon" />
                                Continuar con Google
                            </button>
                        </div>
                        <span>o usa tu nombre/email y contraseña</span>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <input
                            type="text"
                            placeholder="Nombre o Email"
                            name="emailOrUsername"
                            value={formData.emailOrUsername}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete='off'
                        />
                        <a href="#">¿Olvidaste tu contraseña?</a>
                        <button type="submit">Iniciar Sesión</button>
                    </form>
                </div>

                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>¡Bienvenido de nuevo!</h1>
                            <p>Ingresa tus datos personales para usar todas las funciones del sitio</p>
                            <button className="hidden" onClick={() => setIsActive(false)}>Iniciar Sesión</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>¡Hola, amigo!</h1>
                            <p>Regístrate con tus datos personales para usar todas las funciones del sitio</p>
                            <button className="hidden" onClick={() => setIsActive(true)}>Registrarse</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthModal;