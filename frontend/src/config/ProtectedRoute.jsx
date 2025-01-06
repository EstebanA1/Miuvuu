import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ROLE_PERMISSIONS = {
    admin: ['all'],
    vendedor: [
        'view_products',
        'manage_products',
        'view_profile',
        'manage_favorites',
        'view_cart'
    ],
    usuario: [
        'view_products',
        'view_profile',
        'manage_favorites',
        'view_cart'
    ],
    public: [
        'view_products',
        'auth'
    ]
};

export const ProtectedRoute = ({ element, requiredPermission }) => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const userRole = user?.rol || 'public';

    const hasPermission = () => {
        const userPermissions = ROLE_PERMISSIONS[userRole];
        return userPermissions?.includes('all') || userPermissions?.includes(requiredPermission);
    };

    if (!hasPermission()) {
        if (!user) {
            return <Navigate to="/auth" state={{ from: location }} replace />;
        }
        return <Navigate to="/" replace />;
    }

    return element;
};