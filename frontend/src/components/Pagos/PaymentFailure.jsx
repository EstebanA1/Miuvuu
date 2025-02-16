import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-status-container">
            <div className="payment-status-card">
                <div className="status-icon failure">
                    <i className="fas fa-times-circle"></i>
                </div>
                <h2>Error en el Pago</h2>
                <p>Lo sentimos, hubo un problema al procesar tu pago.</p>
                <button 
                    className="status-button"
                    onClick={() => navigate('/carrito')}
                >
                    Volver al carrito
                </button>
            </div>
        </div>
    );
};

export default PaymentFailure;