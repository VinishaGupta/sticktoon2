import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  Instagram,
  ChevronDown,
  Mail,
} from "lucide-react";

import { Badge, CartItem } from "./types";
import { CATEGORIES } from "./constants";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import BadgeDetail from "./pages/BadgeDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import CustomOrder from "./pages/CustomOrder";
import Contact from "./pages/Contact";
import About from "./pages/About";

/* =======================
   AUTH USER (Mongo-based)
======================= */
type AuthUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
};

/* =======================
   LOGO
======================= */
const Logo: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.2 : 1;
  return (
    <div style={{ transform: `scale(${scale})` }} className="select-none">
      <div className="flex items-center text-3xl font-black text-white">
        STICKTOON
      </div>
    </div>
  );
};

/* =======================
   NAVBAR
======================= */
const Navbar: React.FC<{ cartCount: number; user: AuthUser | null }> = ({
  cartCount,
  user,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "CATEGORIES", path: "/categories" },
    { name: "CUSTOMIZE", path: "/custom-order" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? "bg-white shadow py-4" : "py-8"
      }`}
    >
      <div className="px-6 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden lg:flex gap-10">
          {navLinks.map((l) => (
            <Link
              key={l.name}
              to={l.path}
              className={`font-black text-sm ${
                location.pathname === l.path
                  ? "text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              {l.name}
              {l.name === "CATEGORIES" && <ChevronDown className="inline w-4" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/checkout" className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-indigo-600 text-white rounded-full px-2">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name || "User"}`
                }
                className="w-9 h-9 rounded-full cursor-pointer"
              />
              <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded opacity-0 group-hover:opacity-100 transition">
                <div className="px-4 py-2 border-b">
                  <p className="font-bold">{user.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <UserIcon />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

/* =======================
   FOOTER
======================= */
const Footer = () => (
  <footer className="bg-slate-900 text-white py-10 text-center">
    <p className="text-xs text-slate-400">
      © 2024 STICKTOON MARKETPLACE
    </p>
    <div className="flex justify-center gap-4 mt-4">
      <Instagram />
      <Mail />
    </div>
  </footer>
);

/* =======================
   APP
======================= */
export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  /* 🔐 JWT AUTH CHECK */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addToCart = (badge: Badge, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === badge.id);
      if (found)
        return prev.map((i) =>
          i.id === badge.id ? { ...i, quantity: i.quantity + qty } : i
        );
      return [...prev, { ...badge, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, q: number) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
    );

  return (
    <HashRouter>
      <Navbar
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        user={user}
      />

      <main className="pt-28 min-h-screen">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/categories" element={<Categories addToCart={addToCart} />} />
          <Route path="/badge/:id" element={<BadgeDetail addToCart={addToCart} />} />
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/custom-order" element={<CustomOrder addToCart={addToCart} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <Footer />
    </HashRouter>
  );
}
