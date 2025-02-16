import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentPending = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-status-container">
            <div className="payment-status-card">
                <div className="status-icon pending">
                    <i className="fas fa-clock"></i>
                </div>
                <h2>Pago Pendiente</h2>
                <p>Tu pago está siendo procesado. Te notificaremos cuando se complete.</p>
                <button 
                    className="status-button"
                    onClick={() => navigate('/')}
                >
                    Volver a la tienda
                </button>
            </div>
        </div>
    );
};

export default PaymentPending;