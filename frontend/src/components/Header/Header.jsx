import "./Header.css";
import { IconButton, Badge, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import miuvuuLogo from "@assets/miuvuuIcon.svg";
import SearchIcon from '@mui/icons-material/Search';
import { getCategorias } from "../../services/categorias";
import React, { useEffect, useState, useRef } from "react";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AuthModal from '../Auth/AuthModal';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useCart } from '../../context/CartContext';
import SortIcon from '@mui/icons-material/Sort';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header = ({ onCategorySelect, onSearch, filter, onHomeClick, onSortChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [hoveredGenero, setHoveredGenero] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isFirstRender = useRef(true);
  const { cartCount } = useCart();
  const [sortBy, setSortBy] = useState('default');

  // Estados y funciones para el menú mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMobileGenre, setSelectedMobileGenre] = useState(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  useEffect(() => {
    const handleUserLogin = (event) => {
      const userData = event.detail;
      if (userData) {
        setUser({
          ...userData,
          isAdmin: userData.rol === 'admin'
        });
        setAuthModalOpen(false);
      }
    };

    window.addEventListener('userLogin', handleUserLogin);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          isAdmin: parsedUser.rol === 'admin'
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.isAdmin = parsedUser.rol === 'admin';
          setUser(parsedUser);
        } catch (error) {
          console.error('Error al parsear usuario:', error);
        }
      }
    };

    checkAuth();
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('token')) {
        authService.handleGoogleCallback();
      }
    };

    handleUrlChange();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.isAdmin = parsedUser.rol === 'admin';
        setUser(parsedUser);
        if (isFirstRender.current) {
          console.log('Inicio exitoso!');
          isFirstRender.current = false;
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  }, []);

  const handleAccountClick = (event) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    handleMenuClose();
    navigate('/', { replace: true });
  };

  const handleManageAccounts = () => {
    navigate('/manage-users');
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50);
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
        const generosUnicos = [...new Set(data.map((categoria) => categoria.genero))];
        setGeneros(generosUnicos);
      } catch (error) {
        console.error('Error al obtener las categorías', error);
      }
    };

    fetchCategorias();
  }, []);

  // Funciones para el menú mobile
  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    setSelectedMobileGenre(null);
  };

  const handleMobileGenreClick = (genre) => {
    setSelectedMobileGenre(genre);
  };

  const handleMobileCategorySelect = (category, genre) => {
    onCategorySelect(category, genre);
    handleMobileMenuClose();
  };

  const handleMobileGenreSelect = (genre) => {
    onCategorySelect(null, genre);
    handleMobileMenuClose();
  };

  const handleMouseEnter = (genero) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setHoveredGenero(genero);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredGenero(null);
    }, 200);
    setHideTimeout(timeout);
  };

  const handleGeneroClick = (genero) => {
    setHoveredGenero(genero);
    onCategorySelect(null, genero);
    setSearchQuery('');
  };

  const handleSearchIconClick = () => {
    console.log('Buscando:', searchQuery);
    onSearch(searchQuery);
    setSearchQuery('');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch(searchQuery);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      if (!user) {
        localStorage.setItem('pendingProduct', event.detail.productId);
        setAuthModalOpen(true);
      }
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, [user]);

  return (
    <>
      <header className={`header ${isDarkMode ? 'dark-mode' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="header-content">
          {/* Botón menú solo en mobile */}
          {isMobile && (
            <IconButton onClick={handleMobileMenuOpen} aria-label="Menú" className="mobile-menu-button">
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo centrado */}
          <div
            className="logo-section"
            onClick={(e) => {
              e.preventDefault();
              onHomeClick();
            }}
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <img src={miuvuuLogo} alt="Miuvuu Logo" className="logo" />
            <span className="logo-text">Miuvuu</span>
          </div>

          {/* Se muestran los géneros y subcategorías solo en pantallas grandes */}
          {!isMobile && (
            <div className={`header-selecters ${user ? (user.isAdmin ? 'admin' : 'logged-in') : 'logged-out'}`}>
              <nav className="categories">
                <ul>
                  {generos.map((genero) => (
                    <li
                      key={genero}
                      onMouseEnter={() => handleMouseEnter(genero)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleGeneroClick(genero)}
                      className="category-item"
                    >
                      {genero}
                    </li>
                  ))}
                </ul>
                {hoveredGenero && (
                  <div
                    className="subcategories"
                    onMouseEnter={() => handleMouseEnter(hoveredGenero)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <ul>
                      {categorias
                        .filter((categoria) => categoria.genero === hoveredGenero)
                        .map((categoria) => (
                          <li
                            key={categoria.id}
                            onClick={() => onCategorySelect(categoria.nombre, hoveredGenero)}
                            className="subcategory-item"
                          >
                            {categoria.nombre}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </nav>
            </div>
          )}

          {/* Íconos a la derecha */}
          <div className="header-icons">
            {/* En desktop se muestran el buscador y ordenamiento en el header */}
            {!isMobile && (
              <>
                <div className="search-container">
                  <input
                    type="text"
                    aria-label="Buscar productos"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    ref={inputRef}
                  />
                  <IconButton onClick={handleSearchIconClick} aria-label="Buscar">
                    <SearchIcon />
                  </IconButton>
                </div>
                <div className="sort-control-div">
                  <FormControl size="small" className="sort-control">
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      displayEmpty
                      variant="outlined"
                      startAdornment={<SortIcon />}
                      renderValue={() => ''}
                      sx={{
                        height: 30,
                        width: 80,
                        marginRight: 2,
                        backgroundColor: 'rgba(69, 69, 69, 0.08)',
                        borderRadius: '4px',
                        transition: 'none',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid transparent'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid transparent'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid transparent'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(69, 69, 69, 0.08)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(69, 69, 69, 0.08)'
                        }
                      }}
                    >
                      <MenuItem value="default">Por defecto</MenuItem>
                      <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                      <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                      <MenuItem value="name_asc">Nombre: A-Z</MenuItem>
                      <MenuItem value="name_desc">Nombre: Z-A</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </>
            )}
            {authService.hasPermission('manage_favorites') && (
              <IconButton onClick={() => navigate('/favoritos')} aria-label="Ir a favoritos">
                <FavoriteIcon />
              </IconButton>
            )}
            {authService.hasPermission('view_cart') && (
              <IconButton onClick={() => navigate('/carrito')} aria-label="Ir al carrito">
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
            <IconButton onClick={handleAccountClick} aria-label="Acceder a la cuenta">
              <AccountCircleIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>Mi Perfil</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
            </Menu>
            {authService.hasPermission('all') && (
              <IconButton onClick={handleManageAccounts} aria-label="Administrar cuentas">
                <ManageAccountsIcon />
              </IconButton>
            )}
          </div>
        </div>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} headerVisible={isVisible} />
      </header>

      {isMobile && (
        <Drawer anchor="left" open={mobileMenuOpen} onClose={handleMobileMenuClose}>
          <div style={{ width: 250, padding: '10px' }}>
            <div className="drawer-header" >
              <div className="drawer-search" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(69, 69, 69, 0.08)',
                    border: '1px solid transparent'
                  }}
                />
                <IconButton onClick={handleSearchIconClick} aria-label="Buscar">
                  <SearchIcon />
                </IconButton>
              </div>
              <div className="drawer-sort">
                <FormControl size="small" style={{ width: '100%' }}>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    displayEmpty
                    variant="outlined"
                    startAdornment={<SortIcon />}
                    renderValue={() => 'Ordenar'}
                    style={{ backgroundColor: 'rgba(69, 69, 69, 0.08)', borderRadius: '4px' }}
                  >
                    <MenuItem value="default">Por defecto</MenuItem>
                    <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                    <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                    <MenuItem value="name_asc">Nombre: A-Z</MenuItem>
                    <MenuItem value="name_desc">Nombre: Z-A</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <Divider />
            {/* Menú lateral para géneros y categorías */}
            {selectedMobileGenre ? (
              <List>
                <ListItem button onClick={() => setSelectedMobileGenre(null)}>
                  <ArrowBackIcon />
                  <ListItemText primary="Volver" />
                </ListItem>
                <ListItem button onClick={() => handleMobileGenreSelect(selectedMobileGenre)}>
                  <ListItemText primary={`Todos en ${selectedMobileGenre}`} />
                </ListItem>
                {categorias
                  .filter(categoria => categoria.genero === selectedMobileGenre)
                  .map(categoria => (
                    <ListItem button key={categoria.id} onClick={() => handleMobileCategorySelect(categoria.nombre, selectedMobileGenre)}>
                      <ListItemText primary={categoria.nombre} />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <List>
                {generos.map((genre) => (
                  <ListItem button key={genre} onClick={() => handleMobileGenreClick(genre)}>
                    <ListItemText primary={genre} />
                  </ListItem>
                ))}
              </List>
            )}
          </div>
        </Drawer>
      )}
    </>
  );
};

export default Header;
