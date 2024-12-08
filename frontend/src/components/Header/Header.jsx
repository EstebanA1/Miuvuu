import React, { useEffect, useState } from "react";
import { getCategorias } from "../../services/categorias";
import "./Header.css";
import miuvuuLogo from "@assets/miuvuuLogo2.webp";

// MUI Imports
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { TextField, IconButton } from '@mui/material';

const Header = ({ onCategorySelect }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [hoveredGenero, setHoveredGenero] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);

  // New state for search functionality
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50);
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
        console.error("Error al obtener las categorías", error);
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
  };

  const handleSearchIconClick = () => {
    if (isSearchVisible && searchQuery.trim() !== '') {
      // Perform search
      console.log('Searching for:', searchQuery);
      // Add your search logic here
    }
    setIsSearchVisible(!isSearchVisible);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <header className={`header ${isVisible ? "visible" : "hidden"}`}>
      <div className="header-content">
        <div
          className="logo-section"
          onClick={() => onCategorySelect(null)}
          style={{ cursor: "pointer" }}
        >
          <img src={miuvuuLogo} alt="Miuvuu Logo" className="logo" />
          <span className="logo-text">Miuvuu</span>
        </div>

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

        <div className="header-icons">
<div className="search-container" style={{
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.1)',
  position: 'relative', // Necesario para posicionar el campo de búsqueda en relación al contenedor
  borderRadius: '4px',
  padding: '0 8px'
}}>
  {isSearchVisible && (
    <TextField 
      value={searchQuery}
      onChange={handleSearchChange}
      variant="standard" 
      size="small"
      style={{
        flexGrow: 1, // Asegura que el campo de búsqueda ocupe todo el espacio disponible
        marginRight: '8px', // Se agrega un margen para evitar que se solape con el icono
        zIndex: 10, // Asegura que el campo de búsqueda esté por encima del icono
      }}
      InputProps={{
        disableUnderline: true,
      }}
    />
  )}
  <IconButton onClick={handleSearchIconClick}>
    <SearchIcon style={{ color: 'rgba(0,0,0,0.54)' }} />
  </IconButton>
</div>

          <IconButton>
            <ShoppingCartIcon />
          </IconButton>
          <IconButton>
            <AccountCircleIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
};

export default Header;