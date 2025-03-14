import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/authService';
import './AuthModal.css';
import { Eye, EyeOff } from 'lucide-react';

const AuthModal = ({ open, onClose, headerVisible }) => {
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const modalRef = useRef(null);

    // Cierra el modal si se hace clic fuera del contenedor
    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            if (e.target.className.includes('auth-modal-overlay')) {
                onClose();
            }
        }
    };

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            // Deshabilitar scroll cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'auto';
        };
    }, [open, onClose]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const result = await authService.login({
                emailOrUsername: formData.emailOrUsername,
                password: formData.password,
            });
            if (result.success) {
                setSuccess('¡Inicio de sesión exitoso, cargando!');
                const pendingProduct = localStorage.getItem('pendingProduct');
                localStorage.removeItem('pendingProduct');
                await new Promise((resolve) => setTimeout(resolve, 1500));
                onClose();
                if (pendingProduct) {
                    window.location.href = `/producto/${pendingProduct}`;
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
            setTimeout(() => {
                setError('');
            }, 3000);
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
            setSuccess('¡Registro exitoso!');
            setTimeout(() => {
                setIsActive(false);
                setFormData({
                    emailOrUsername: '',
                    password: '',
                    confirmPassword: '',
                    nombre: '',
                    email: '',
                });
                window.location.reload();
            }, 2000);
        } catch (error) {
            if (error.detail && error.detail.includes('usuarios_correo_key')) {
                setError('Este correo electrónico ya está registrado, utilizar otro.');
            } else {
                setError(error.message || 'Error al registrarse');
            }
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    if (!open) return null;

    const containerStyle = {
        marginTop: headerVisible ? '-158px' : '0px' 
    };

    return (
        <div className="auth-modal-overlay">
            <div ref={modalRef} className={`container ${isActive ? 'active' : ''}`} style={containerStyle}>
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister}>
                        <h1>Crear Cuenta</h1>
                        <div className="social-icons"></div>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <input
                            type="text"
                            placeholder="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <div className="password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                            <button className="showPS" type="button" onClick={() => togglePasswordVisibility('password')}>
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        <div className="password-input">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar Contraseña"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                            <button className="showPS2" type="button" onClick={() => togglePasswordVisibility("confirmPassword")}>
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        <button className="registerBT" type="submit">Registrarse</button>
                    </form>
                </div>

                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Iniciar Sesión</h1>
                        <div className="social-icons">
                            <button
                                type="button"
                                className="google-button"
                                onClick={() => {
                                    console.log('Botón de Google clickeado');
                                    window.location.href = "http://127.0.0.1:8000/api/auth/google/login";
                                }}
                            >
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
                            autoComplete="off"
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <button className="showPS3" type="button" onClick={() => togglePasswordVisibility("password")}>
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                        <a href="#">¿Olvidaste tu contraseña?</a>
                        <button className="loginBT" type="submit">Iniciar Sesión</button>
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
                            <h1>¡Bienvenido a Miuvuu!</h1>
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
