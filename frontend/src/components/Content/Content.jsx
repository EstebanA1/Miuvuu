import "./Content.css";
import { Button, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddProductForm from "../Productos/addProductos/AddProductForm";
import EditProductForm from "../Productos/editProductos/EditProductForm";
import DeleteProductForm from "../Productos/deleteProductos/DeleteProductForm";
import { getProductos, formatImageUrl, getCarouselProducts } from "../../services/productos";
import { authService } from "../../services/authService";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useFavorites } from '../../context/FavoritesContext';
import Pagination from '../Pagination/Pagination';
import { useSearchParams } from 'react-router-dom';
import { formatPrice } from '../Utils/priceFormatter';
import Carousel from '../Carousel/Carousel';

const ITEMS_PER_PAGE = 15;

const Content = ({ filter, sortBy = 'default' }) => {
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
  const [carouselProducts, setCarouselProducts] = useState([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/' && !filter.category && !filter.gender && !filter.searchQuery && currentPage === 1;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const marginTopValue = window.matchMedia('(min-width: 768px)').matches
    ? (
      (filter.category || filter.gender)
        ? "20px"
        : (filter.searchQuery
          ? "100px"
          : (currentPage === 1 ? "20px" : "100px")
        )
    )
    : (
      (filter.category || filter.gender)
        ? "20px"
        : (filter.searchQuery
          ? "50px"
          : ((location.pathname === '/' && !filter.category && !filter.gender && !filter.searchQuery)
            ? (currentPage === 1 ? "20px" : "90px")
            : "30px"
          )
        )
    );



  const sortProducts = (products, sortMethod) => {
    let sortedProducts = [...products];

    switch (sortMethod) {
      case 'price_asc':
        sortedProducts.sort((a, b) => a.precio - b.precio);
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => b.precio - a.precio);
        break;
      case 'name_asc':
        sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name_desc':
        sortedProducts.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        break;
    }
    return sortedProducts;
  };

  const loadCarouselProducts = async () => {
    if (isHomePage) {
      try {
        const products = await getCarouselProducts();
        setCarouselProducts(products);
      } catch (error) {
        console.error("Error loading carousel products:", error);
        setCarouselProducts([]);
      }
    }
  };

  const fetchProductos = async (filterParams = filter) => {
    try {
      const query = [];
      if (filterParams.category)
        query.push(`categoria=${encodeURIComponent(filterParams.category)}`);
      if (filterParams.gender)
        query.push(`genero=${encodeURIComponent(filterParams.gender)}`);
      if (filterParams.searchQuery)
        query.push(`searchQuery=${encodeURIComponent(filterParams.searchQuery)}`);

      if (sortBy && sortBy !== 'default') {
        query.push(`sortBy=${sortBy}`);
      }

      query.push(`page=${currentPage}`);
      query.push(`limit=${ITEMS_PER_PAGE}`);

      if (!filterParams.category && !filterParams.gender && !filterParams.searchQuery && currentPage === 1 && !isHomePage) {
        return;
      }

      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      const response = await getProductos(queryString);
      const sortedProducts = sortProducts(response.products, sortBy);

      setProductos(sortedProducts);
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
    const loadData = async () => {
      if (!window.isFilterUpdateInProgress) {
        await fetchProductos();
        if (isHomePage) {
          await loadCarouselProducts();
        }
      }
      window.isFilterUpdateInProgress = false;
    };

    loadData();
  }, [filter, currentPage, sortBy, isHomePage]);

  useEffect(() => {
    if (!isHomePage) {
      setCarouselProducts([]);
    }
  }, [location.pathname]);

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

  useEffect(() => {
    const checkUserRole = () => {
      const user = authService.getCurrentUser();
      if (user && (user.rol === 'admin' || user.rol === 'vendedor')) {
        setIsAdmin(true);
      }
    };
    checkUserRole();
  }, []);

  const hasAdminPrivileges = () => {
    const user = authService.getCurrentUser();
    return user && (user.rol === 'admin' || user.rol === 'vendedor');
  };

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

  return (
    <div className={`content-container ${isHomePage ? 'home-layout' : ''}`}>
      {isHomePage && carouselProducts.length > 0 && (
        <div className="carousel-section">
          <Carousel productos={carouselProducts} />
        </div>
      )}

      {hasAdminPrivileges() && (
        <Button
          variant="contained"
          color="primary"
          aria-label="Añadir Producto"
          onClick={() => handleOpenModal("add")}
          className="add-product-button"
        >
          Añadir Producto
        </Button>
      )}

      {modalState.add && (
        <AddProductForm
          closeModal={() => handleCloseModal("add")}
          onSuccess={fetchProductos}
        />
      )}

      <div className="centerContainer">
        <div
          className="center-content">

          {isHomePage && <h1 className="content-title">Nuestros Productos</h1>}

          {(filter.category || filter.gender) && (
            <h2>
              {filter.category ? `${filter.category} de ${filter.gender}` : filter.gender ? `Prendas de ${filter.gender}` : ""}
            </h2>
          )}

          <div
            className="product-list"
            style={{ marginTop: marginTopValue }}
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="product-card"
                aria-label="Producto"
                onClick={() => handleProductClick(producto)}
                style={{ cursor: 'pointer' }}
              >
                {producto.image_url && <img src={formatImageUrl(producto.image_url)} alt={producto.nombre} />}
                <div className="principalInfo">
                  <div className="upperSection">
                    <span className="product-name">{producto.nombre}</span>
                    <span className="product-price">{formatPrice(producto.precio)}</span>
                  </div>
                </div>
                {user && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        window.dispatchEvent(new CustomEvent('openAuthModal', {
                          detail: { productId: producto.id }
                        }));
                        return;
                      }
                      toggleFavorite(producto);
                    }}
                    sx={{
                      color: favorites.includes(producto.id) ? 'red' : 'gray',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: favorites.includes(producto.id) ? '#ff3333' : '#666'
                      }
                    }}
                    aria-label="Agregar a favoritos"
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