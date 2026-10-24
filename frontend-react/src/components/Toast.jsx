import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import ProductImage from "./ProductImage.jsx";
import { CheckIcon } from "./Icons.jsx";

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="toast" key={toast.id} role="status">
      <ProductImage src={toast.image} alt={toast.name} width={96} className="toast-img" />
      <div>
        <p className="toast-title"><CheckIcon width={16} height={16} /> Added to cart</p>
        <p className="toast-sub">{toast.name}</p>
      </div>
      <Link to="/cart" className="toast-link">View</Link>
    </div>
  );
}
