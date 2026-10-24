import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, searchApi } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useReveal } from "../hooks/useReveal.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { BagIcon, ReturnIcon, ShieldIcon, TruckIcon } from "../components/Icons.jsx";
import { formatPrice } from "../utils.js";

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setProduct(null);
    api(`/products/${id}`).then(setProduct).catch((e) => setError(e.message));
    searchApi(`/products/${id}/recommendations`).then(setRelated).catch(() => setRelated([]));
  }, [id]);

  useReveal([related]);

  if (error) return <div className="container narrow"><p className="alert">{error}</p></div>;
  if (!product) {
    return (
      <div className="container detail-grid">
        <div className="skeleton detail-skeleton" />
        <div><div className="skeleton line short" /><div className="skeleton line" /><div className="skeleton line medium" /></div>
      </div>
    );
  }

  const soldOut = product.stock === 0;

  return (
    <>
      <div className="container">
        <nav className="crumbs">
          <Link to="/">Shop</Link> <span>/</span> <span>{product.category}</span> <span>/</span>
          <span className="current">{product.name}</span>
        </nav>
      </div>

      <section className="container detail-grid">
        <div className="detail-media">
          <ProductImage src={product.image} alt={product.name} width={900} height={1000} />
        </div>

        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="lead">{product.description}</p>

          <p className={`stock ${soldOut ? "out" : product.stock <= 15 ? "low" : "in"}`}>
            <span className="dot" />
            {soldOut ? "Out of stock" : product.stock <= 15 ? `Only ${product.stock} left` : "In stock, ready to ship"}
          </p>

          <button className="btn btn-primary btn-lg" disabled={soldOut} onClick={() => addItem(product)}>
            <BagIcon width={18} height={18} /> Add to cart
          </button>

          <ul className="assurances">
            <li><TruckIcon /> Free delivery on orders above ₹999</li>
            <li><ReturnIcon /> Easy 7-day returns</li>
            <li><ShieldIcon /> Secure, encrypted checkout</li>
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container shop">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommended for you</span>
              <h2>You may also like</h2>
            </div>
          </div>
          <div className="grid">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
}
