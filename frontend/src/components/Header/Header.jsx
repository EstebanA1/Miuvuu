import "./Header.css";
import { IconButton } from '@mui/material';
import miuvuuLogo from "@assets/miuvuuLogo2.webp";
import SearchIcon from '@mui/icons-material/Search';
import { getCategorias } from "../../services/categorias";
import React, { useEffect, useState, useRef } from "react";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ onCategorySelect, onSearch, filter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [hoveredGenero, setHoveredGenero] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState(filter.searchQuery);
  const inputRef = useRef(null);

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
    setSearchQuery('');
  };

  const handleSearchIconClick = () => {
    console.log("Buscando:", searchQuery);
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

        <div className="header-selecters">
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
