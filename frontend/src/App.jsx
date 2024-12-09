import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Content from "./components/Content/Content";

const HomePage = () => <div>Welcome to the Home Page</div>;

const App = () => {
  const [filter, setFilter] = useState({ category: null, gender: null, searchQuery: "" });

  const handleCategorySelect = (categoryName, gender = null) => {
    console.log("Categoría seleccionada:", categoryName);  
    console.log("Género:", gender);  
    setFilter({ category: categoryName, gender, searchQuery: "" });
  };
  
  const handleSearch = (searchQuery) => {
    setFilter({ ...filter, searchQuery, category: null, gender: null });
  };

  return (
    <div className="App">
      <Router>
        <Header onCategorySelect={handleCategorySelect} onSearch={handleSearch} filter={filter} />
        <Routes>
          <Route
            path="/"
            element={
              <Content
                leftVisible={false}
                rightVisible={false}
                filter={filter}
              >
                <HomePage />
              </Content>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
