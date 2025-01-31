import "./Content.css";
import { Button, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddProductForm from "../Productos/addProductos/AddProductForm";
import EditProductForm from "../Productos/editProductos/EditProductForm";
import DeleteProductForm from "../Productos/deleteProductos/DeleteProductForm";
import { getProductos } from "../../services/productos";
import { authService } from "../../services/authService";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFavorites } from '../../context/FavoritesContext';
import Pagination from '../Pagination/Pagination';
import { useSearchParams } from 'react-router-dom';

const ITEMS_PER_PAGE = 15;

const Content = ({ filter }) => {
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState(0);
  const currentPage = parseInt(searchParams.get('page')) || 1;

  const fetchProductos = async (filterParams = filter) => {
    try {
      const query = [];
      if (filterParams.category) query.push(`categoria=${encodeURIComponent(filterParams.category)}`);
      if (filterParams.gender) query.push(`genero=${encodeURIComponent(filterParams.gender)}`);
      if (filterParams.searchQuery) query.push(`searchQuery=${encodeURIComponent(filterParams.searchQuery)}`);

      query.push(`page=${currentPage}`);
      query.push(`limit=${ITEMS_PER_PAGE}`);

      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      const response = await getProductos(queryString);
    
      setProductos(response.products);
      setTotalProducts(response.total);
  
    } catch (error) {
      console.error("Error al obtener productos", error);
      setProductos([]);
      setTotalProducts(0);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage);
      return prev;
    });
  };

  useEffect(() => {
    if (!window.isFilterUpdateInProgress) {
      fetchProductos();
    }
    window.isFilterUpdateInProgress = false;
  }, [filter, currentPage]);

  useEffect(() => {
    const handleFilterUpdate = (event) => {
      const newFilter = event.detail;
      fetchProductos(newFilter);
    };

    window.addEventListener('filterUpdate', handleFilterUpdate);
    return () => window.removeEventListener('filterUpdate', handleFilterUpdate);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const hasAdminPrivileges = () => {
    const user = authService.getCurrentUser();
    return user && (user.rol === 'admin' || user.rol === 'vendedor');
  };

  useEffect(() => {
    const checkUserRole = () => {
      const user = authService.getCurrentUser();
      if (user && (user.rol === 'admin' || user.rol === 'vendedor')) {
        setIsAdmin(true);
      }
    };
    checkUserRole();
  }, []);

  const handleOpenModal = (type, product = null) => {
    if (!hasAdminPrivileges()) {
      console.warn("Acceso no autorizado");
      return;
    }
    setModalState((prevState) => ({ ...prevState, [type]: true }));
    if (type === "edit") setProductToEdit(product);
    if (type === "delete") setSelectedProduct(product);
  };

  const handleCloseModal = (type) => {
    try {
      setModalState((prevState) => ({ ...prevState, [type]: false }));
      if (type === "edit") setProductToEdit(null);
      if (type === "delete") setSelectedProduct(null);
    } catch (error) {
      console.debug('Error al cerrar el modal:', error);
    }
  };

  const handleProductDeleted = () => {
    fetchProductos();
    handleCloseModal("delete");
  };

  const handleUpdateProduct = async () => {
    await fetchProductos();
    handleCloseModal("edit");
  };

  const handleProductClick = (producto) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuthModal', {
        detail: { productId: producto.id }
      }));
      return;
    }
    navigate(`/producto/${producto.id}`);
  };


  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="content-container">
      {hasAdminPrivileges() && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal("add")}
          className="add-product-button"
        >
          Añadir Producto
        </Button>
      )}

      {modalState.add && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddProductForm
              closeModal={() => handleCloseModal("add")}
              onSuccess={fetchProductos}
            />
          </div>
        </div>
      )}

      <div className="centerContainer">
        <div className="center-content">
          <h2>
            {filter.category ? `${filter.category} de ${filter.gender}` : filter.gender ? `Prendas de ${filter.gender}` : ""}
          </h2>

          <div className="product-list">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="product-card"
                onClick={() => handleProductClick(producto)}
                style={{ cursor: 'pointer' }}
              >
                {producto.image_url && <img src={producto.image_url} alt={producto.nombre} />}
                <div className="principalInfo">
                  <div className="upperSection">
                    <span className="product-name">{producto.nombre}</span>
                    <span className="product-price">${producto.precio}</span>
                  </div>
                </div>
                {user && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(producto);
                    }}
                    sx={{
                      color: favorites.includes(producto.id) ? 'red' : 'gray',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: favorites.includes(producto.id) ? '#ff3333' : '#666'
                      }
                    }}
                    className="favorite-button"
                  >
                    <FavoriteIcon />
                  </IconButton>
                )}
                {hasAdminPrivileges() && (
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      sx={{ color: 'rgb(17 96 174)' }}
                      onClick={() => handleOpenModal("edit", producto)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'rgb(207 21 21)' }}
                      onClick={() => handleOpenModal("delete", producto)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}
          </div>
          {totalProducts > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {modalState.edit && productToEdit && (
        <EditProductForm
          product={productToEdit}
          onUpdate={handleUpdateProduct}
          onCancel={() => handleCloseModal("edit")}
        />
      )}
      {modalState.delete && selectedProduct && (
        <DeleteProductForm
          productName={selectedProduct.nombre}
          productId={selectedProduct.id}
          onCancel={() => handleCloseModal("delete")}
          onProductDeleted={handleProductDeleted}
        />
      )}
    </div>
  );
};

export default Content;