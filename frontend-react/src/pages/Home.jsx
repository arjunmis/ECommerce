import { useEffect, useMemo, useState } from "react";
import { api, searchApi } from "../api.js";
import { useReveal } from "../hooks/useReveal.js";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { ArrowIcon, ReturnIcon, SearchIcon, ShieldIcon, TruckIcon } from "../components/Icons.jsx";
import { HERO_IMAGE } from "../utils.js";

const PERKS = [
  { icon: TruckIcon, title: "Free delivery", text: "On orders above ₹999" },
  { icon: ReturnIcon, title: "7-day returns", text: "No questions asked" },
  { icon: ShieldIcon, title: "Secure checkout", text: "JWT-protected accounts" },
];

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevance");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  // Initial list comes from the Node.js API.
  useEffect(() => {
    api("/products?limit=50")
      .then((data) => {
        setAllProducts(data.items);
        setProducts(data.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))].sort(),
    [allProducts]
  );

  // Search, sort and category filters go to the Python FastAPI service.
  const runSearch = async (next = {}) => {
    const params = { q: query, sort, category, ...next };
    setError("");
    setLoading(true);
    try {
      const search = new URLSearchParams({ q: params.q, sort: params.sort });
      if (params.category) search.set("category", params.category);
      const data = await searchApi(`/search?${search}`);
      setProducts(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickCategory = (value) => {
    setCategory(value);
    runSearch({ category: value });
  };

  useReveal([products, loading]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill">New season · Up to 30% off</span>
            <h1>
              Everyday essentials,<br />
              <span className="accent-text">beautifully</span> simple.
            </h1>
            <p className="lead">
              Electronics, clothing and home goods picked for quality, priced fairly and
              delivered fast.
            </p>
            <div className="hero-actions">
              <a href="#shop" className="btn btn-primary">
                Shop now <ArrowIcon width={18} height={18} />
              </a>
              <span className="hero-stat"><strong>{allProducts.length || "8"}+</strong> curated products</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="blob blob-orange" />
            <div className="blob blob-violet" />
            <ProductImage src={HERO_IMAGE} alt="Shopper with bags" width={720} height={820} className="hero-img" />
            <div className="float-card">
              <span className="float-dot" />
              <div>
                <strong>Order shipped</strong>
                <small>Arrives in 2 days</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container perks">
        {PERKS.map(({ icon: Icon, title, text }, i) => (
          <div className="perk" key={title} data-reveal style={{ "--i": i }}>
            <span className="perk-icon"><Icon /></span>
            <div><strong>{title}</strong><small>{text}</small></div>
          </div>
        ))}
      </section>

      <section className="container shop" id="shop">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop the collection</span>
            <h2>Popular right now</h2>
          </div>
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <SearchIcon />
            <input
              placeholder="Search headphones, shoes, lamps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <select
              value={sort}
              aria-label="Sort"
              onChange={(e) => {
                setSort(e.target.value);
                runSearch({ sort: e.target.value });
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
            <button type="submit" className="btn btn-dark">Search</button>
          </form>
        </div>

        <div className="chips">
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              className={`chip ${category === c ? "active" : ""}`}
              onClick={() => pickCategory(c)}
            >
              {c || "All"}
            </button>
          ))}
        </div>

        {error && <p className="alert">{error}</p>}

        <div className="grid">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p._id || p.id} product={p} index={i} />)}
        </div>

        {!loading && !error && products.length === 0 && (
          <div className="empty">
            <h3>No products found</h3>
            <p>Try a different search or category.</p>
          </div>
        )}
      </section>
    </>
  );
}
