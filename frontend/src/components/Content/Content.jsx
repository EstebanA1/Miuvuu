import "./Content.css";
import Carousel from "../Carousel/Carousel";
import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddProductForm from "../Productos/addProductos/AddProductForm";
import EditProductForm from "../Productos/editProductos/EditProductForm";
import DeleteProductForm from "../Productos/deleteProductos/DeleteProductForm";
import { getProductos } from "../../services/productos";

const Content = ({ leftVisible, rightVisible, filter }) => {
  const [productos, setProductos] = useState([]);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
  });
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProductos = async () => {
    try {
      const query = [];
      if (filter.category) query.push(`categoria=${encodeURIComponent(filter.category)}`);
      if (filter.gender) query.push(`genero=${encodeURIComponent(filter.gender)}`);
      if (filter.searchQuery) query.push(`searchQuery=${encodeURIComponent(filter.searchQuery)}`);

      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      const data = await getProductos(queryString);
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [filter]);

  const handleOpenModal = (type, product = null) => {
    setModalState((prevState) => ({ ...prevState, [type]: true }));
    if (type === "edit") setProductToEdit(product);
    if (type === "delete") setSelectedProduct(product);
  };

  const handleCloseModal = (type) => {
    setModalState((prevState) => ({ ...prevState, [type]: false }));
    if (type === "edit") setProductToEdit(null);
    if (type === "delete") setSelectedProduct(null);
  };

  const handleProductDeleted = () => {
    fetchProductos(); // Actualizar la lista después de eliminar
    handleCloseModal("delete");
  };

  const handleUpdateProduct = async (updatedProduct) => {
    await fetchProductos(); // Actualizar la lista después de editar
    handleCloseModal("edit");
  };

  return (
    <div className="content-container">
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenModal("add")}
        className="add-product-button"
      >
        Añadir Producto
      </Button>

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

      <div className={`leftContainer ${leftVisible ? "" : "hidden"}`} />

      <div className="centerContainer">
        <div className="center-content">
          <h2>
            {filter.category ? `${filter.category} de ${filter.gender}` : filter.gender ? `Prendas de ${filter.gender}` : ""}
          </h2>
          <div className="product-list">
            {productos.map((producto) => (
              <div key={producto.id} className="product-card">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Precio: ${producto.precio}</p>
                <p>Cantidad: {producto.cantidad}</p>
                {producto.image_url && <img src={producto.image_url} alt={producto.nombre} />}
                <div className="card-actions">
                  <IconButton sx={{ color: 'rgb(17 96 174);' }} onClick={() => handleOpenModal("edit", producto)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton sx={{ color: 'rgb(207 21 21)' }} onClick={() => handleOpenModal("delete", producto)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`rightContainer ${rightVisible ? "" : "hidden"}`} />

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