import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { AUTH_IMAGE } from "../utils.js";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <section className="container auth">
      <div className="auth-visual">
        <ProductImage src={AUTH_IMAGE} alt="ShopNest store" width={800} height={1000} />
        <div className="auth-quote">
          <p>“Great quality, fast delivery and a checkout that just works.”</p>
          <span>— A happy ShopNest customer</span>
        </div>
      </div>

      <form className="auth-card form" onSubmit={submit} key={mode}>
        <span className="eyebrow">{mode === "login" ? "Welcome back" : "Join ShopNest"}</span>
        <h1>{mode === "login" ? "Sign in to your account" : "Create your account"}</h1>

        {mode === "register" && (
          <>
            <label className="field-label" htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={set("name")} />
          </>
        )}
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" required type="email" value={form.email} onChange={set("email")} />
        <label className="field-label" htmlFor="password">Password</label>
        <input id="password" required type="password" minLength={6} value={form.password} onChange={set("password")} />

        {error && <p className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p className="muted center">
          {mode === "login" ? "New to ShopNest? " : "Already have an account? "}
          <button type="button" className="text-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        {mode === "login" && (
          <p className="demo-hint">Demo: user@shopnest.dev / user123 · admin@shopnest.dev / admin123</p>
        )}
      </form>
    </section>
  );
}
