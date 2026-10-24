import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";

const CartContext = createContext(null);

function cartReducer(items, action) {
  switch (action.type) {
    case "add": {
      const existing = items.find((i) => i._id === action.product._id);
      if (existing) {
        return items.map((i) =>
          i._id === action.product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...items, { ...action.product, quantity: 1 }];
    }
    case "setQty":
      return items
        .map((i) => (i._id === action.id ? { ...i, quantity: action.quantity } : i))
        .filter((i) => i.quantity > 0);
    case "remove":
      return items.filter((i) => i._id !== action.id);
    case "clear":
      return [];
    default:
      return items;
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("shopnest_cart")) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  useEffect(() => {
    try {
      localStorage.setItem("shopnest_cart", JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  // Adds a product and shows a short confirmation toast.
  const addItem = useCallback((product) => {
    dispatch({ type: "add", product });
    clearTimeout(timer.current);
    setToast({ id: Date.now(), name: product.name, image: product.image });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, dispatch, addItem, toast }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
