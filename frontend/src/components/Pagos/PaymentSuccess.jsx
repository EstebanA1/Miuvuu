import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { finalizarOrden } from '../../services/orderService';
import './PaymentStatus.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const finalizar = async () => {
            try {
                await finalizarOrden(user.id);
                navigate('/');
            } catch (error) {
                console.error('Error al finalizar la orden:', error);
            }
        };
        finalizar();
    }, [navigate, user.id]);

    return (
        <div className='payment-status-container'>
            <h1>Pago realizado exitosamente</h1>
            <p>Estamos finalizando tu orden...</p>
        </div>
    );
};

export default PaymentSuccess;
