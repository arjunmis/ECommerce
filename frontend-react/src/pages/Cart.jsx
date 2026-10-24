import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { ArrowIcon, BagIcon, TrashIcon } from "../components/Icons.jsx";
import { formatPrice } from "../utils.js";

const FREE_SHIPPING = 999;

export default function Cart() {
  const { items, total, dispatch } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ address: "", city: "", pincode: "" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const shipping = total >= FREE_SHIPPING || total === 0 ? 0 : 79;
  const progress = Math.min((total / FREE_SHIPPING) * 100, 100);

  const checkout = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setError("");
    setPlacing(true);
    try {
      await api("/orders", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
          shippingAddress: address,
        },
      });
      dispatch({ type: "clear" });
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container narrow empty big">
        <span className="empty-icon"><BagIcon width={32} height={32} /></span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">Start shopping <ArrowIcon width={18} height={18} /></Link>
      </div>
    );
  }

  return (
    <section className="container">
      <div className="page-head">
        <h1>Your cart</h1>
        <p className="muted">{items.length} item{items.length > 1 ? "s" : ""}</p>
      </div>

      <div className="cart-grid">
        <div className="cart-list">
          {items.map((i, idx) => (
            <div className="cart-item" key={i._id} style={{ "--i": idx }}>
              <ProductImage src={i.image} alt={i.name} width={200} className="cart-thumb" />
              <div className="cart-info">
                <span className="eyebrow">{i.category}</span>
                <Link to={`/product/${i._id}`} className="product-name">{i.name}</Link>
                <span className="muted">{formatPrice(i.price)} each</span>
              </div>
              <div className="qty">
                <button aria-label="Decrease" onClick={() => dispatch({ type: "setQty", id: i._id, quantity: i.quantity - 1 })}>−</button>
                <span>{i.quantity}</span>
                <button aria-label="Increase" onClick={() => dispatch({ type: "setQty", id: i._id, quantity: i.quantity + 1 })}>+</button>
              </div>
              <span className="cart-line">{formatPrice(i.price * i.quantity)}</span>
              <button className="remove-btn" aria-label={`Remove ${i.name}`} onClick={() => dispatch({ type: "remove", id: i._id })}>
                <TrashIcon width={18} height={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="ship-progress">
            <p>
              {shipping === 0
                ? "You've unlocked free delivery 🎉"
                : `Add ${formatPrice(FREE_SHIPPING - total)} more for free delivery`}
            </p>
            <div className="bar"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="row"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
          <div className="row"><span>Delivery</span><span>{shipping ? formatPrice(shipping) : "Free"}</span></div>
          <div className="row total"><span>Total</span><span>{formatPrice(total + shipping)}</span></div>

          <form className="form" onSubmit={checkout}>
            <label className="field-label">Shipping address</label>
            <input required placeholder="House no., street, area" value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })} />
            <div className="two">
              <input required placeholder="City" value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input required placeholder="Pincode" inputMode="numeric" value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
            </div>
            {error && <p className="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block" disabled={placing}>
              {placing ? "Placing order…" : user ? "Place order" : "Sign in to checkout"}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
