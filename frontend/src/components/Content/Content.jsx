import React, { useEffect, useState } from "react";
import { getProductos } from "../../services/productos";
import Carousel from "../Carousel/Carousel";
import "./Content.css";
import AddProductForm from "../addProductos/AddProductForm";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

const Content = ({ leftVisible, rightVisible, filter }) => {
  const [productos, setProductos] = useState([]);
  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const query = [];
        if (filter.category) {
          query.push(`categoria=${encodeURIComponent(filter.category)}`);
          console.log("Filtro por categoría:", filter.category);
        }
        if (filter.gender) {
          query.push(`genero=${encodeURIComponent(filter.gender)}`);
          console.log("Filtro por género:", filter.gender);
        }
        if (filter.searchQuery) {
          query.push(`searchQuery=${encodeURIComponent(filter.searchQuery)}`);
          console.log("Filtro por búsqueda:", filter.searchQuery);
        }
        
        const queryString = query.length > 0 ? `?${query.join("&")}` : "";
        const data = await getProductos(queryString);
  
        setProductos(data);
      } catch (error) {
        console.error("Hubo un error al obtener los productos", error);
      }
    };
  
    fetchProductos();
  }, [filter]);
  
  

  const handleOpenAddProductForm = () => {
    setIsAddProductFormOpen(true);
  };

  const handleCloseAddProductForm = () => {
    setIsAddProductFormOpen(false);
  };

  const latestProducts = productos.slice(0, 5);

  return (
    <div className="content-container">
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenAddProductForm}
        style={{
          position: 'absolute',
          top: '100px',
          left: '10px',
          zIndex: 10,
          visibility: 'visible',
          opacity: 1
        }}
      >
        Añadir Producto
      </Button>

      {isAddProductFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
          }}>
            <AddProductForm closeModal={handleCloseAddProductForm} />
          </div>
        </div>
      )}

      <div className={`leftContainer ${leftVisible ? "" : "hidden"}`}></div>

      <div className="centerContainer">
        <div className="center-content">
          <h2>
            Productos {filter.category ? `en ${filter.category}` : filter.gender ? `del género ${filter.gender}` : ""}
          </h2>
          <div className="product-list">
            {productos.map((producto) => (
              <div key={producto.id} className="product-card">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Precio: ${producto.precio}</p>
                <p>Cantidad: {producto.cantidad}</p>
                {producto.image_url && (
                  <img src={producto.image_url} alt={producto.nombre} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`rightContainer ${rightVisible ? "" : "hidden"}`}></div>
    </div>
  );
};

export default Content;
