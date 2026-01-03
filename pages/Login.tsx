import React, { useState } from "react";
import { Eye, EyeOff, Sparkle, Loader2 } from "lucide-react";

/* =========================
   VALIDATION HELPERS
========================== */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPasswordStrength = (password: string) => {
  if (password.length < 6) return "weak";
  if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return "strong";
  return "medium";
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  /* =========================
     LOGIN
  ========================== */
  const handleLogin = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      saveAuth(data);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SIGNUP (NO PASSWORD BLOCKING)
  ========================== */
  const handleSignup = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // ❗ Password strength is informational only
    // ❗ No blocking for weak / medium passwords

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      // ✅ directly save auth (no second login call)
      saveAuth(data);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAVE AUTH
  ========================== */
const saveAuth = (data: any) => {
  const name = data.user.name?.trim() || "User";

  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: data.user._id,
      name,
      email: data.user.email,
      avatar: name.charAt(0).toUpperCase(), // ✅ INITIAL
    })
  );

  window.location.href = "/";
};

  /* =========================
     GOOGLE (UI ONLY)
  ========================== */
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      alert("Google login will be added later 🚀");
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="max-w-[360px] w-full bg-white rounded-[1.6rem] px-6 py-6 shadow-lg border border-slate-100">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-blue-100">
            <Sparkle className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {isLogin ? "Access your vault" : "Start your collection"}
          </p>
        </div>

        {/* Toggle */}
        <div className="relative flex p-1.5 bg-slate-100 rounded-2xl mb-6">
          <div
            className={`absolute top-1.5 left-1.5
              w-[calc(50%-6px)]
              h-[calc(100%-12px)]
              bg-white rounded-xl shadow-sm
              transition-transform duration-300 z-0
              ${!isLogin ? "translate-x-[100%]" : "translate-x-0"}
            `}
          />
          <button
            onClick={() => setIsLogin(true)}
            className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest ${
              isLogin ? "text-blue-600" : "text-slate-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest ${
              !isLogin ? "text-blue-600" : "text-slate-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={`w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 ${
              email && !isValidEmail(email)
                ? "border-red-400"
                : "border-slate-50"
            }`}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-slate-50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength (INFO ONLY) */}
          {!isLogin && password && (
            <p
              className={`text-xs font-bold ${
                passwordStrength === "strong"
                  ? "text-green-600"
                  : passwordStrength === "medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              Password strength: {passwordStrength}
            </p>
          )}

          {error && (
            <p className="text-xs text-red-600 text-center font-bold">
              {error}
            </p>
          )}

          <button
            onClick={isLogin ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Enter The Hub"
              : "Create Account"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 border-t border-slate-100" />
          <div className="relative text-center text-[10px] font-black text-slate-300 bg-white px-4 w-fit mx-auto">
            OR CONTINUE WITH
          </div>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase"
        >
          {isGoogleLoading ? "Loading..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
