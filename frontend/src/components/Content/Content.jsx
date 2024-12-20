import React, { useEffect, useState } from "react";
import { getProductos } from "../../services/productos";
import Carousel from "../Carousel/Carousel";
import "./Content.css";
import AddProductForm from "../addProductos/AddProductForm";
import { Button } from "@mui/material"; // Assuming you're using Material-UI
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
        } else if (filter.gender) {
          query.push(`genero=${encodeURIComponent(filter.gender)}`);
        }

        const queryString = query.length > 0 ? `?${query.join("&")}` : "";

        const data = await getProductos(queryString);
        console.log("Productos recibidos:", data);

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
          visibility: 'visible',  // Explicitly set visibility
          opacity: 1  // Ensure full opacity
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
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '600px'
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