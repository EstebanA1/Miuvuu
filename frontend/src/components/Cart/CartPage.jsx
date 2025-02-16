import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carritoService';
import { getProductos, formatImageUrl } from '../../services/productos';
import { useCart } from '../../context/CartContext';
import { createMercadoPagoPreference } from '../../services/PaymentService';
import { formatPrice } from '../Utils/priceFormatter';
import './CartPage.css';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateCart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isTestMode = true;
    const colors = {
        'Blanco': '#FFFFFF',
        'Negro': '#000000',
        'Gris': '#808080'
    };

    useEffect(() => {
        if (!user?.id) {
            navigate('/');
            return;
        }
        updateCart(user.id)
            .then((data) => {
                setCart(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Error al cargar el carrito');
                setLoading(false);
            });
    }, [user?.id, navigate, updateCart]);

    useEffect(() => {
        getProductos('?page=1&limit=100')
            .then((data) => setProducts(data.products))
            .catch((err) => console.error('Error al cargar productos:', err));
    }, []);

    const calculateTotal = (cartItems) => {
        return cartItems.reduce((acc, cartItem) => {
            const producto = cartItem.product || products.find(p => p.id === cartItem.producto_id);
            if (!producto) return acc;
            return acc + (producto.precio * cartItem.cantidad);
        }, 0);
    };

    const handleQuantityChange = async (productId, color, talla, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await carritoService.updateCart(
                productId,
                user.id,
                newQuantity,
                color,
                talla
            );
            const data = await updateCart(user.id);
            setCart(data);
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            alert('Error al actualizar la cantidad del producto');
        }
    };

    const handleRemoveItem = async (productId, color, talla) => {
        try {
            await carritoService.removeFromCart(
                productId,
                user.id,
                color,
                talla
            );
            const data = await updateCart(user.id);
            setCart(data);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto del carrito');
        }
    };

    const handleProceedToPayment = async () => {
        const total = calculateTotal(cart);
        const orderReference = `ORDER_${Date.now()}`;

        const paymentData = {
            title: `Orden #${orderReference}`,
            quantity: 1,
            unit_price: total,
            success_url: `${window.location.origin}/payment-success`,
            failure_url: `${window.location.origin}/payment-failure`,
            pending_url: `${window.location.origin}/payment-pending`
        };

        console.log("DEBUG: Datos de pago a enviar:", paymentData);

        try {
            const preference = await createMercadoPagoPreference(paymentData);
            console.log("DEBUG: Preferencia recibida:", preference);

            if (isTestMode && preference.sandbox_init_point) {
                window.location.href = preference.sandbox_init_point;
            } else if (preference.init_point) {
                window.location.href = preference.init_point;
            } else {
                throw new Error("No se obtuvo la URL de pago");
            }
        } catch (error) {
            console.error("Error al proceder al pago:", error);
            alert("Error al procesar el pago. Por favor, intenta nuevamente.");
        }
    };

    if (loading) return <div className="loading">Cargando carrito...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!Array.isArray(cart) || cart.length === 0) {
        return (
            <div className="empty-cart">
                <h1>No hay productos en el carrito</h1>
                <p>Explora nuestra tienda y agrega productos al carrito.</p>
            </div>
        );
    }

    const total = calculateTotal(cart);

    return (
        <div className="cart-page">
            <h1>Mi Carrito de Compras</h1>
            <div className="cart-items">
                {cart.map(cartItem => {
                    const producto = cartItem.product || products.find(p => p.id === cartItem.producto_id);
                    if (!producto) return null;
                    const itemKey = `${cartItem.producto_id}-${cartItem.color}-${cartItem.talla}`;

                    const imageSrc = producto.image_url
                        ? (Array.isArray(producto.image_url)
                            ? formatImageUrl(producto.image_url[0])
                            : formatImageUrl(producto.image_url))
                        : '/placeholder-image.jpg';

                    return (
                        <div key={itemKey} className="cart-item">
                            <div className="item-image">
                                <img
                                    src={imageSrc}
                                    alt={producto.nombre}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/producto/${producto.id}`)}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="item-info">
                                <h3>{producto.nombre}</h3>
                                <div className="item-variants">
                                    <div className="variant-info">
                                        <span className="variant-label">Talla: </span>
                                        <span className="size-badge">{cartItem.talla}</span>
                                    </div>
                                    <div className="variant-info">
                                        <span className="variant-label">Color:</span>
                                        <div
                                            className="color-circle"
                                            style={{
                                                backgroundColor: colors[cartItem.color],
                                                border: cartItem.color === 'Blanco' ? '1px solid #ddd' : 'none'
                                            }}
                                            title={cartItem.color}
                                        />
                                    </div>
                                </div>
                                <span className="variant-label">
                                    Precio unitario: {formatPrice(producto.precio)}
                                </span>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                cartItem.producto_id,
                                                cartItem.color,
                                                cartItem.talla,
                                                cartItem.cantidad - 1
                                            )
                                        }
                                        disabled={cartItem.cantidad <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{cartItem.cantidad}</span>
                                    <button
                                        onClick={() =>
                                            handleQuantityChange(
                                                cartItem.producto_id,
                                                cartItem.color,
                                                cartItem.talla,
                                                cartItem.cantidad + 1
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="lastSection">
                                <div className="item-total">
                                    <p>Total: {formatPrice(producto.precio * cartItem.cantidad)}</p>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() =>
                                        handleRemoveItem(
                                            cartItem.producto_id,
                                            cartItem.color,
                                            cartItem.talla
                                        )
                                    }
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="cart-summary">
                <h2>Total del Carrito: {formatPrice(total)}</h2>
                <button className="checkout-btn" onClick={handleProceedToPayment}>
                    Proceder al Pago
                </button>
            </div>
        </div>
    );
};

export default CartPage;
