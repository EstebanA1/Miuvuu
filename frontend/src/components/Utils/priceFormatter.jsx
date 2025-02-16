export const formatPrice = (price) => {
    if (typeof price !== 'number') {
        price = Number(price);
    }
    
    if (isNaN(price)) {
        return '$0';
    }

    const priceStr = Math.floor(price).toString();
    
    const groups = [];
    for (let i = priceStr.length; i > 0; i -= 3) {
        groups.unshift(priceStr.slice(Math.max(0, i - 3), i));
    }
    
    return `$${groups.join('.')}`;
};
