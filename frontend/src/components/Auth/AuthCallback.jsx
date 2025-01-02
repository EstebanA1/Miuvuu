import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const token = params.get('token');
                const encodedData = params.get('data');

                if (!token || !encodedData) {
                    console.error('Datos de autenticación incompletos');
                    navigate('/auth/error');
                    return;
                }

                try {
                    const userData = JSON.parse(atob(encodedData));
                    
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));

                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    window.dispatchEvent(new CustomEvent('userLogin', { 
                        detail: userData 
                    }));

                    navigate('/', { replace: true });
                } catch (parseError) {
                    console.error('Error al procesar datos del usuario:', parseError);
                    navigate('/auth/error');
                }

            } catch (error) {
                console.error('Error procesando callback:', error);
                navigate('/auth/error');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Procesando autenticación...</h2>
                <p className="text-gray-600">Por favor espere...</p>
            </div>
        </div>
    );
};

export default AuthCallback;