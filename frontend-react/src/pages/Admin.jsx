import { useEffect, useState } from "react";
import { api, searchApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils.js";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
const emptyProduct = { name: "", category: "", price: "", stock: "", image: "", description: "" };

export default function Admin() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [message, setMessage] = useState("");

  const load = () => {
    searchApi("/reports/sales").then(setReport).catch(() => setReport(null));
    api("/orders", { token }).then(setOrders).catch((e) => setMessage(e.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api("/products", {
        method: "POST",
        token,
        body: { ...product, price: Number(product.price), stock: Number(product.stock) },
      });
      setProduct(emptyProduct);
      setMessage("Product added successfully");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    await api(`/orders/${id}/status`, { method: "PATCH", token, body: { status } });
    load();
  };

  const maxCategory = Math.max(1, ...(report?.by_category || []).map((c) => c.revenue));

  return (
    <section className="container">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Sales report powered by the Python FastAPI service</p>
      </div>

      {report && (
        <div className="stats">
          {[
            { label: "Revenue", value: formatPrice(report.revenue), tone: "orange" },
            { label: "Orders", value: report.orders, tone: "violet" },
            { label: "Avg. order value", value: formatPrice(report.average_order_value), tone: "teal" },
          ].map((s, i) => (
            <div className={`stat stat-${s.tone}`} key={s.label} style={{ "--i": i }}>
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="admin-grid">
        {report && (
          <div className="panel">
            <h3>Revenue by category</h3>
            {report.by_category.length === 0 && <p className="muted">No sales yet.</p>}
            {report.by_category.map((c) => (
              <div className="bar-row" key={c.category}>
                <div className="bar-label"><span>{c.category}</span><span>{formatPrice(c.revenue)}</span></div>
                <div className="bar"><span style={{ width: `${(c.revenue / maxCategory) * 100}%` }} /></div>
              </div>
            ))}
            <h3 className="mt">Top products</h3>
            <ul className="order-items">
              {report.top_products.map((p) => (
                <li key={p.name}><span>{p.name}</span><span className="muted">{p.units} sold</span></li>
              ))}
            </ul>
          </div>
        )}

        <div className="panel">
          <h3>Add product</h3>
          <form className="form" onSubmit={addProduct}>
            {Object.keys(emptyProduct).map((field) => (
              <input
                key={field}
                required={!["description", "image"].includes(field)}
                type={field === "price" || field === "stock" ? "number" : "text"}
                placeholder={field === "image" ? "Image URL (e.g. Unsplash)" : field[0].toUpperCase() + field.slice(1)}
                value={product[field]}
                onChange={(e) => setProduct({ ...product, [field]: e.target.value })}
              />
            ))}
            <button type="submit" className="btn btn-primary">Add product</button>
            {message && <p className="muted">{message}</p>}
          </form>
        </div>
      </div>

      <div className="panel">
        <h3>All orders</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.user?.name}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <select className={`status-select status-${o.status}`} value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
