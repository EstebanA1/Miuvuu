import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const result = await authService.handleGoogleCallback();
                
                if (result.success) {
                    navigate('/', { replace: true });
                } else {
                    console.error('Error en autenticación:', result.error);
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