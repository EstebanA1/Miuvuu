import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Content from "./components/Content/Content";
import Footer from "./components/FooterPages/Footer/Footer";
import About from "./components/FooterPages/About";
import Terms from "./components/FooterPages/Terms";
import Privacy from "./components/FooterPages/Privacy";
import ManageUsersPage from "./components/ManageUser/Page/ManageUsersPage";
import MyProfile from "./components/Profile/MyProfile";
import ProductDetail from "./components/Productos/DetailsProduct/DetailsProduct";
import FavoritesPage from './components/Favorites/FavoritePage';
import { FavoritesProvider } from './context/FavoritesContext';
import AuthCallback from './components/Auth/AuthCallback';
import ErrorPage from './components/ErrorPage/ErrorPage';
import { ProtectedRoute } from './config/ProtectedRoute';
import AuthModal from './components/Auth/AuthModal';
import { CartProvider } from './context/CartContext';
import CartPage from './components/Cart/CartPage';
import PayReturn from './components/Pagos/PayReturn';
import PaymentSuccess from './components/Pagos/PaymentSuccess';
import PaymentFailure from './components/Pagos/PaymentFailure';
import PaymentPending from './components/Pagos/PaymentPending';


const MainContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('default');


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

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

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
        onSortChange={handleSortChange}
      />
      <Routes>
        <Route path="/" element={<Content key={location.search} filter={filter} sortBy={sortBy} />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/auth" element={<AuthModal />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/error" element={<ErrorPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/carrito" element={
          <ProtectedRoute element={<CartPage />} requiredPermission="view_cart" />
        }
        />

        <Route path="/profile" element={
          <ProtectedRoute element={<MyProfile />} requiredPermission="view_profile" />
        }
        />

        <Route path="/favoritos" element={
          <ProtectedRoute element={<FavoritesPage />} requiredPermission="manage_favorites" />
        }
        />

        <Route path="/manage-users" element={
          <ProtectedRoute element={<ManageUsersPage />}
            requiredPermission="all" />
        }
        />

        <Route path="/pay/return" element={<PayReturn />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/payment-pending" element={<PaymentPending />} />

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
          <CartProvider>
            <MainContent />
          </CartProvider>
        </FavoritesProvider>
      </Router>
    </div>
  );
};

export default App;