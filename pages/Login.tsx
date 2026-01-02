import React, { useState } from "react";
import { Eye, EyeOff, Sparkle, Chrome, Loader2 } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // UI-only placeholder
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

          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
            {isLogin ? "Welcome Back" : "Join the Crew"}
          </h2>

          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            {isLogin ? "Access your vault" : "Start your collection"}
          </p>
        </div>

        {/* Toggle */}
        <div className="relative flex p-1.5 bg-slate-100 rounded-2xl mb-6">
          <div
            className={`absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-white rounded-xl shadow-sm transition-all duration-300 ${
              !isLogin ? "translate-x-full" : ""
            }`}
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
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold text-slate-700 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-400 focus:bg-white outline-none font-bold text-slate-700 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
                Forgot Password?
              </button>
            </div>
          )}

          <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-lg">
            {isLogin ? "Enter The Hub" : "Create Account"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black tracking-widest text-slate-300">
            <span className="bg-white px-4">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-4 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Chrome className="w-5 h-5" />
          )}
          Continue with Google
        </button>
      </div>
    </div>
  );
}
