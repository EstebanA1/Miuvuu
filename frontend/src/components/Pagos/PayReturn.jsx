import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PayReturn = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const confirmPayment = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token_ws');

            if (!token) {
                navigate('/payment-failure');
                return;
            }

            try {
                const response = await axios.post('http://localhost:8000/api/pagos/webpay/confirm', {
                    token: token
                });

                if (response.data.status === 'AUTHORIZED') {
                    navigate('/payment-success');
                } else if (response.data.status === 'FAILED') {
                    navigate('/payment-failure');
                } else {
                    navigate('/payment-pending');
                }
            } catch (error) {
                console.error('Error confirming payment:', error);
                navigate('/payment-failure');
            }
        };

        confirmPayment();
    }, [navigate, location]);

    return (
        <div className="webpay-return">
            <h2>Procesando tu pago...</h2>
            <p>Por favor, espera un momento mientras confirmamos tu transacción.</p>
        </div>
    );
};

export default PayReturn;