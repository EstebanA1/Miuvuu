import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Content from "./components/Content/Content";
import ManageUsersPage from "./components/ManageUser/Page/ManageUsersPage";
import MyProfile from "./components/Profile/myProfile";
import ProductDetail from "./components/Productos/DetailsProduct/DetailsProduct";
import FavoritesPage from './components/Favorites/FavoritePage';
import { FavoritesProvider } from './context/FavoritesContext';
import AuthCallback from './components/Auth/AuthCallback';
import ErrorPage from './components/Errorpage/ErrorPage';
import { ProtectedRoute } from './config/ProtectedRoute';
import AuthModal from './components/Auth/AuthModal';

const MainContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const filter = {
    category: searchParams.get("category") || null,
    gender: searchParams.get("gender") || null,
    searchQuery: searchParams.get("search") || ""
  };

  React.useEffect(() => {
    if (location.pathname === "/") {
      window.isFilterUpdateInProgress = true;
      window.dispatchEvent(new CustomEvent('filterUpdate', {
        detail: {
          category: searchParams.get("category"),
          gender: searchParams.get("gender"),
          searchQuery: searchParams.get("search")
        }
      }));
    }
  }, [searchParams, location.pathname]);

  const handleCategorySelect = (categoryName, gender = null) => {
    const params = new URLSearchParams();
    if (categoryName) params.set("category", categoryName);
    if (gender) params.set("gender", gender);
    navigate({ pathname: "/", search: params.toString() }, { replace: true });
  };

  const handleSearch = (searchQuery) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    navigate({ pathname: "/", search: params.toString() }, { replace: true });
  };

  const handleHomeClick = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <Header
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        filter={filter}
        onHomeClick={handleHomeClick}
      />
      <Routes>
        <Route path="/" element={<Content key={location.search} filter={filter} />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/auth" element={<AuthModal />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/error" element={<ErrorPage />} />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute 
              element={<MyProfile />}
              requiredPermission="view_profile"
            />
          }
        />
        <Route 
          path="/favoritos" 
          element={
            <ProtectedRoute 
              element={<FavoritesPage />}
              requiredPermission="manage_favorites"
            />
          }
        />

        <Route 
          path="/manage-users" 
          element={
            <ProtectedRoute 
              element={<ManageUsersPage />}
              requiredPermission="all"
            />
          }
        />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <div className="App">
      <Router>
        <FavoritesProvider>
          <MainContent />
        </FavoritesProvider>
      </Router>
    </div>
  );
};

export default App;