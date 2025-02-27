import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatImageUrl } from "../../services/productos";
import "./Carousel.css";

const Carousel = ({ productos = [] }) => {
  const displayProducts = productos.slice(0, 5);
  const total = displayProducts.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionTo, setTransitionTo] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const navigate = useNavigate();

  // Precarga de imágenes
  useEffect(() => {
    if (total === 0) return;
    displayProducts.forEach((product) => {
      const img = new Image();
      img.src = formatImageUrl(product.image_url);
    });
  }, [displayProducts, total]);

  // Transición automática: se activa solo si no hay una transición en curso
  useEffect(() => {
    if (total === 0 || isChanging) return;
    const timer = setTimeout(() => {
      triggerTransition((currentIndex + 1) % total);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, total, isChanging]);

  // Función central para manejar la transición (manual o automática)
  const triggerTransition = (newIndex) => {
    if (isChanging) return; // Evita solapamientos
    setTransitionTo(newIndex);
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTransitionTo(null);
      setIsChanging(false);
    }, 1000);
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChanging) return;
    const newIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;
    triggerTransition(newIndex);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChanging) return;
    const newIndex = (currentIndex + 1) % total;
    triggerTransition(newIndex);
  };

  const handleViewDetails = (productId) => {
    navigate(`/producto/${productId}`);
  };

  if (total === 0) return null;

  // Mientras se está en transición, usamos transitionTo como imagen de destino;
  // de lo contrario, se muestra el mismo fondo que el actual para evitar cambios indeseados.
  const upcomingIndex = isChanging && transitionTo !== null ? transitionTo : currentIndex;
  const currentProduct = displayProducts[currentIndex];

  return (
    <div className="carousel-wrapper">
      <div className="carousel-container">
        {currentProduct && (
          <div className={`carousel-content ${isChanging ? "carousel-slide-changing" : ""}`}>
            <div className="carousel-slide">
              <div
                className="carousel-blur-background"
                style={{ backgroundImage: `url(${formatImageUrl(currentProduct.image_url)})` }}
              ></div>
              <div
                className="carousel-blur-background-next"
                style={{ backgroundImage: `url(${formatImageUrl(displayProducts[upcomingIndex].image_url)})` }}
              ></div>

              <img
                src={formatImageUrl(currentProduct.image_url)}
                alt={currentProduct.nombre}
                className="carousel-image"
              />

              <div className="carousel-button-container">
                <Button variant="contained" onClick={() => handleViewDetails(currentProduct.id)}>
                  Ver Detalles
                </Button>
              </div>
            </div>

            <button
              onClick={handlePrevious}
              className="carousel-navigation-button prev"
              aria-label="Anterior producto"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={handleNext}
              className="carousel-navigation-button next"
              aria-label="Siguiente producto"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carousel;
