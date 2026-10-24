import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils.js";

const STEPS = ["pending", "paid", "shipped", "delivered"];

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/orders/mine", { token }).then(setOrders).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <div className="container narrow"><p className="alert">{error}</p></div>;

  return (
    <section className="container narrow">
      <div className="page-head">
        <h1>My orders</h1>
        <p className="muted">Track and review your purchases</p>
      </div>

      {orders === null && <div className="skeleton order-skeleton" />}
      {orders?.length === 0 && (
        <div className="empty big">
          <h2>No orders yet</h2>
          <p>When you place an order it will show up here.</p>
          <Link to="/" className="btn btn-primary">Browse products</Link>
        </div>
      )}

      {orders?.map((o, idx) => {
        const step = STEPS.indexOf(o.status);
        return (
          <article key={o._id} className="order-card" style={{ "--i": idx }}>
            <header>
              <div>
                <span className="eyebrow">Order #{o._id.slice(-6).toUpperCase()}</span>
                <p className="muted">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`status status-${o.status}`}>{o.status}</span>
            </header>

            {o.status !== "cancelled" && (
              <ol className="steps">
                {STEPS.map((s, i) => (
                  <li key={s} className={i <= step ? "done" : ""}><span />{s}</li>
                ))}
              </ol>
            )}

            <ul className="order-items">
              {o.items.map((i) => (
                <li key={i.product}>
                  <span>{i.name} <span className="muted">× {i.quantity}</span></span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <footer>
              <span className="muted">{o.shippingAddress?.city}</span>
              <strong>{formatPrice(o.total)}</strong>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
