import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carritoService } from '../../services/carritoService';
import { getProductos } from '../../services/productos';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const { updateCart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const colors = {
        'Blanco': '#FFFFFF',
        'Negro': '#000000',
        'Gris': '#808080'
    };

    const calculateTotal = (cartItems, productList) => {
        if (!Array.isArray(cartItems) || !Array.isArray(productList)) return 0;

        return cartItems.reduce((acc, cartItem) => {
            const product = productList.find(p => p.id === cartItem.producto_id);
            if (!product) return acc;
            return acc + (product.precio * cartItem.cantidad);
        }, 0);
    };

    useEffect(() => {
        if (!user?.id) {
            navigate('/');
            return;
        }

        let isSubscribed = true;

        const loadCartAndProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const [cartResponse, productsResponse] = await Promise.all([
                    carritoService.getCart(user.id),
                    getProductos()
                ]);

                if (!isSubscribed) return;

                const cartData = cartResponse.data?.carrito || [];
                setCart(cartData);

                const { products: productsData } = productsResponse;
                setProducts(productsData);

                setTotal(calculateTotal(cartData, productsData));
            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (isSubscribed) {
                    setError('Error al cargar el carrito');
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        loadCartAndProducts();

        return () => {
            isSubscribed = false;
        };
    }, [user?.id, navigate]);


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

            const updatedCart = cart.map(item => {
                if (
                    item.producto_id === productId &&
                    item.color === color &&
                    item.talla === talla
                ) {
                    return { ...item, cantidad: newQuantity };
                }
                return item;
            });

            setCart(updatedCart);
            setTotal(calculateTotal(updatedCart, products));
            updateCart(user.id);
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

            const updatedCart = cart.filter(item =>
                !(item.producto_id === productId &&
                    item.color === color &&
                    item.talla === talla)
            );

            setCart(updatedCart);
            setTotal(calculateTotal(updatedCart, products));
            updateCart(user.id);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto del carrito');
        }
    };

    if (loading) return <div className="loading">Cargando carrito...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!Array.isArray(cart) || cart.length === 0) {
        return (
            <div className="empty-cart">
                <h1>No hay productos en tu carrito</h1>
                <p>Explora nuestra tienda y agrega productos a tu carrito.</p>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Tu Carrito de Compras</h1>
            <div className="cart-items">
                {cart.map(cartItem => {
                    const product = products.find(p => p.id === cartItem.producto_id);
                    if (!product) return null;

                    const itemKey = `${cartItem.producto_id}-${cartItem.color}-${cartItem.talla}`;

                    return (
                        <div key={itemKey} className="cart-item">

                            <div className="item-image">
                                <img
                                    src={product.image_url}
                                    alt={product.nombre}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="item-info">
                                <h3>{product.nombre}</h3>
                                <div className="item-variants">
                                    <div className="variant-info">
                                        <span className="variant-label">Talla: </span>
                                        <span className="size-badge">
                                            {cartItem.talla}
                                        </span>
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
                                <span className="variant-label">Precio unitario: ${product.precio.toFixed(2)}</span>
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => handleQuantityChange(
                                            cartItem.producto_id,
                                            cartItem.color,
                                            cartItem.talla,
                                            cartItem.cantidad - 1
                                        )}
                                        disabled={cartItem.cantidad <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{cartItem.cantidad}</span>
                                    <button
                                        onClick={() => handleQuantityChange(
                                            cartItem.producto_id,
                                            cartItem.color,
                                            cartItem.talla,
                                            cartItem.cantidad + 1
                                        )}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="lastSection">
                                <div className="item-total">
                                    <p>Total: ${(product.precio * cartItem.cantidad).toFixed(2)}</p>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveItem(
                                        cartItem.producto_id,
                                        cartItem.color,
                                        cartItem.talla
                                    )}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="cart-summary">
                <h2>Total del Carrito: ${total.toFixed(2)}</h2>
                <button className="checkout-btn">Proceder al Pago</button>
            </div>
        </div>
    );
};

export default CartPage;