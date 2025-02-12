import React, { useEffect, useState } from "react";
import "./Carousel.css";

const Carousel = ({ productos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % productos.length);
    }, 3000); // Cambiar cada 3 segundos
    return () => clearInterval(interval);
  }, [productos]);

  if (!productos.length) {
    return null; 
  }

  return (
    <div className="carousel-container">
      {productos.map((producto, index) => (
        <div
          key={producto.id}
          className={`carousel-item ${
            index === currentIndex ? "active" : "inactive"
          }`}
        >
          <img src={producto.image_url} alt={producto.nombre} />
          <div className="carousel-caption">
            <h3>{producto.nombre}</h3>
            <p>{producto.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
