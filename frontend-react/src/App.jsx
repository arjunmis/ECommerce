import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";
import Home from "./pages/Home.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Orders from "./pages/Orders.jsx";
import Admin from "./pages/Admin.jsx";
import Toast from "./components/Toast.jsx";
import { BagIcon, UserIcon } from "./components/Icons.jsx";

function RequireAuth({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>ShopNest
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>Shop</NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
        </nav>
        <div className="header-actions">
          {user ? (
            <button className="ghost-btn" onClick={logout} title="Log out">
              <UserIcon /> <span className="hide-sm">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <Link to="/login" className="ghost-btn"><UserIcon /> <span className="hide-sm">Sign in</span></Link>
          )}
          <Link to="/cart" className="cart-btn" aria-label={`Cart, ${count} items`}>
            <BagIcon />
            {count > 0 && <span className="badge-count" key={count}>{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="brand light"><span className="brand-mark">S</span>ShopNest</Link>
          <p>Everyday essentials, thoughtfully picked and delivered across India.</p>
        </div>
        <div className="footer-cols">
          <div><h4>Shop</h4><Link to="/">All products</Link><Link to="/cart">Cart</Link></div>
          <div><h4>Account</h4><Link to="/login">Sign in</Link><Link to="/orders">Orders</Link></div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ShopNest</span>
        <span>Built with React · Node.js · FastAPI</span>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();

  // Braces matter: scrollTo() returns a Promise in newer browsers, and a
  // useEffect callback must not return anything except a cleanup function.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app">
      <Header />
      <main className="page" key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth adminOnly><Admin /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
