import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils.js";
import ProductImage from "./ProductImage.jsx";
import { BagIcon } from "./Icons.jsx";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const id = product._id || product.id;
  const soldOut = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 15;

  return (
    <article className="product-card" data-reveal style={{ "--i": index % 8 }}>
      <Link to={`/product/${id}`} className="product-media">
        <ProductImage src={product.image} alt={product.name} width={520} height={600} />
        {soldOut && <span className="tag tag-dark">Sold out</span>}
        {lowStock && <span className="tag tag-rose">Only {product.stock} left</span>}
      </Link>
      <div className="product-body">
        <span className="eyebrow">{product.category}</span>
        <Link to={`/product/${id}`} className="product-name">{product.name}</Link>
        <div className="product-foot">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            className="icon-btn"
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem({ ...product, _id: id })}
          >
            <BagIcon width={18} height={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: "13 / 15" }} />
      <div className="product-body">
        <div className="skeleton line short" />
        <div className="skeleton line" />
        <div className="skeleton line medium" />
      </div>
    </div>
  );
}
