import React, { useState } from "react";
import { Eye, EyeOff, Sparkle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

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
  /* =========================
     STATE
  ========================== */
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength = getPasswordStrength(password);

  /* =========================
     SAVE AUTH
  ========================== */
  const saveAuth = (data: any) => {
    const displayName = data.user.name?.trim() || "User";

    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user._id,
        name: displayName,
        email: data.user.email,
        avatar: displayName.charAt(0).toUpperCase(),
      })
    );

    window.location.href = "/";
  };

  /* =========================
     LOGIN
  ========================== */
  const handleLogin = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
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
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SIGNUP
  ========================== */
  const handleSignup = async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

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

      saveAuth(data);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORGOT PASSWORD
  ========================== */
  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send reset link");
        return;
      }

      setSuccess("Reset link generated (check console)");
      console.log("RESET LINK:", data.resetUrl);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================== */
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleLoading(true);

        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const googleUser = await res.json();

        const backendRes = await fetch(
          "http://localhost:5000/api/auth/google",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: googleUser.name,
              email: googleUser.email,
              avatar: googleUser.picture,
            }),
          }
        );

        const data = await backendRes.json();
        if (!backendRes.ok) {
          setError(data.message || "Google login failed");
          return;
        }

        saveAuth(data);
      } catch {
        setError("Google login failed");
      } finally {
        setIsGoogleLoading(false);
      }
    },
  });

  /* =========================
     UI
  ========================== */
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="max-w-[360px] w-full bg-white rounded-[1.6rem] px-6 py-6 shadow-lg border border-slate-100">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <Sparkle className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {forgotMode
              ? "Reset Password"
              : isLogin
              ? "Welcome Back"
              : "Create Account"}
          </h2>
        </div>

        {/* Toggle */}
        {!forgotMode && (
          <div className="relative flex p-1.5 bg-slate-100 rounded-2xl mb-6">
            <div
              className={`absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-white rounded-xl transition-transform ${
                !isLogin ? "translate-x-full" : ""
              }`}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black ${
                isLogin ? "text-blue-600" : "text-slate-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black ${
                !isLogin ? "text-blue-600" : "text-slate-400"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && !forgotMode && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2"
          />

          {!forgotMode && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {!isLogin && password && !forgotMode && (
            <p className="text-xs font-bold">
              Password strength: {passwordStrength}
            </p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <button
            onClick={
              forgotMode
                ? handleForgotPassword
                : isLogin
                ? handleLogin
                : handleSignup
            }
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs"
          >
            {loading
              ? "Please wait..."
              : forgotMode
              ? "Send Reset Link"
              : isLogin
              ? "Enter The Hub"
              : "Create Account"}
          </button>

          {isLogin && !forgotMode && (
            <button
              onClick={() => setForgotMode(true)}
              className="w-full text-xs font-black text-blue-600"
            >
              Forgot Password?
            </button>
          )}

          {forgotMode && (
            <button
              onClick={() => setForgotMode(false)}
              className="w-full text-xs font-black text-slate-500"
            >
              Back to Login
            </button>
          )}
        </div>

        {/* Google */}
        {!forgotMode && (
          <>
            <div className="my-4 text-center text-xs text-slate-400">
              OR CONTINUE WITH
            </div>
            <button
              onClick={() => googleLogin()}
              disabled={isGoogleLoading}
              className="w-full py-4 border-2 rounded-2xl text-xs font-black"
            >
              {isGoogleLoading ? "Loading..." : "Continue with Google"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
