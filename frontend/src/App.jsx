import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Content from "./components/Content/Content";
import ManageUsersPage from "./components/ManageUser/Page/ManageUsersPage";

const App = () => {
  const [filter, setFilter] = useState({ category: null, gender: null, searchQuery: "" });

  const handleCategorySelect = (categoryName, gender = null) => {
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
          <Route path="/" element={<Content
            leftVisible={false}
            rightVisible={false}
            filter={filter} />
          } />
          <Route path="/manage-users" element={<ManageUsersPage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;