import "./Header.css";
import { IconButton, Switch } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
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

const Header = ({ onCategorySelect, onSearch, filter, onHomeClick }) => {
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

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

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
    // También verificar cuando la URL cambia
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('token')) {
        authService.handleGoogleCallback();
      }
    };

    handleUrlChange();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    handleMenuClose();
    window.location.reload();
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

  return (
    <header className={`header ${isDarkMode ? 'dark-mode' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="header-content">
        <div
          className="logo-section"
          onClick={(e) => {
            e.preventDefault();
            onHomeClick();
          }}
          style={{ cursor: "pointer" }}
        >
          <img src={miuvuuLogo} alt="Miuvuu Logo" className="logo" />
          <span className="logo-text">Miuvuu</span>
        </div>

        <div
          className={`header-selecters ${user ? (user.isAdmin ? 'admin' : 'logged-in') : 'logged-out'}`}
        >
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



        <div className="header-icons">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              ref={inputRef}
            />
            <IconButton onClick={handleSearchIconClick}>
              <SearchIcon />
            </IconButton>
          </div>
          {user && (
            <>
              <IconButton onClick={() => navigate('/favoritos')}>
                <FavoriteIcon />
              </IconButton>
              <IconButton>
                <ShoppingCartIcon />
              </IconButton>
            </>
          )}
          <div className="dark-mode-toggle">
            <IconButton onClick={toggleDarkMode}>
              {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </div>
          <IconButton onClick={handleAccountClick}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              navigate('/profile');
              handleMenuClose();
            }}>Mi Perfil</MenuItem>
            <MenuItem onClick={handleMenuClose}>Mis Pedidos</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
          {user && user.isAdmin === true && (
            <IconButton onClick={handleManageAccounts}>
              <ManageAccountsIcon />
            </IconButton>
          )}

        </div>
      </div>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};

export default Header;
