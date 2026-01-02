import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  Search, 
  Heart, 
  Instagram, 
  Twitter, 
  Youtube,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Mail,
  ContactIcon,
  Contact2
} from 'lucide-react';
import { Badge, CartItem, User as UserType } from './types.ts';
import { CATEGORIES } from './constants.tsx';
import Home from './pages/Home.tsx';
import Categories from './pages/Categories.tsx';
import BadgeDetail from './pages/BadgeDetail.tsx';
import Checkout from './pages/Checkout.tsx';
import Login from './pages/Login.tsx';
import CustomOrder from './pages/CustomOrder.tsx';
import Contact from './pages/Contact.tsx';
import About from './pages/About.tsx';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
// import { auth } from "../firebase";



// --- Shared Components ---

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.2 : 1;
  
  return (
    <div className="perspective-container inline-block select-none" style={{ transform: `scale(${scale})` }}>
      <div className="logo-interactive relative flex items-center justify-center transition-all duration-500 hover:scale-105"
           style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Decorative Badge Backing in Electric Cyan */}
        <div className="absolute w-14 h-14 rounded-full border-[4px] border-slate-900 bg-[#06B6D4] -z-10 translate-x-2 -translate-y-1 shadow-[4px_4px_0px_#0f172a]">
          <div className="absolute inset-0 border-t-[6px] border-white/20 rounded-full"></div>
        </div>
        
        {/* Logo Text Styling with New Palette */}
        <div className="flex items-center text-3xl font-black tracking-tighter text-white drop-shadow-[0_4px_0px_rgba(15,23,42,1)]"
             style={{ WebkitTextStroke: '2px #0f172a' }}>
          <span>STICKT</span>
          {/* Interactive O's (Eyes) */}
          <div className="relative inline-flex gap-0.5 translate-y-1 mx-0.5">
            {[1, 2].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white border-[4px] border-slate-900 flex items-center justify-center overflow-hidden shadow-inner">
                <div className="eye-blink w-2.5 h-3.5 bg-slate-900 rounded-full"></div>
              </div>
            ))}
          </div>
          <span>N</span>
        </div>
      </div>
    </div>
  );
};

// import { User } from "firebase/auth";

const Navbar: React.FC<{ cartCount: number; user: User | null }> = ({
  cartCount,
  user
}) => {

  

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
  await signOut(auth);
};
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'CATEGORIES', path: '/categories' },
    { name: 'CUSTOMIZE', path: '/custom-order' },
    { name: 'BULK ORDER', path: '/contact' },
    { name: 'CONTACT', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-indigo-100 shadow-sm' : 'py-8 bg-transparent'
    }`}>
      <div className="max-w-full mx-auto px-4 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-10">
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              {isOpen ? <X /> : <Menu />}
            </button>
            <Link to="/" className="flex items-center gap-1 group transform hover:scale-105 transition-transform duration-300">
              <Logo size="md" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-16">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  to={link.path}
                  className={`flex items-center gap-2 text-[14px] font-black tracking-[0.2em] transition-all relative group-hover:text-indigo-600 ${
                    location.pathname === link.path ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {link.name}
                  {link.name === 'CATEGORIES' && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
                  <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-indigo-600 transform origin-left transition-transform duration-300 ${
                    location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>

                {/* Categories Dropdown */}
                {link.name === 'CATEGORIES' && (
                  <div className="absolute top-full left-0 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-[100]">
                    <div className="bg-white rounded-3xl shadow-[0_40px_80px_-15px_rgba(67,56,202,0.15)] border border-indigo-50 w-64 overflow-hidden py-4">
                      {CATEGORIES.map((cat) => (
                        <Link 
                          key={cat.id} 
                          to={`/categories?cat=${cat.id}`}
                          className="flex items-center justify-between px-8 py-4 text-sm font-black text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all uppercase tracking-widest border-l-[4px] border-transparent hover:border-indigo-600"
                        >
                          {cat.name}
                          <span className="text-[10px] text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">{cat.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {/* <div className="hidden md:flex relative group">
              <input 
                type="text" 
                placeholder="Find your vibe..." 
                className="bg-indigo-50/50 rounded-2xl py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-48 lg:w-64 transition-all placeholder:text-slate-400 font-bold border border-indigo-100/50 focus:bg-white"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div> */}
            
            <div className="flex items-center gap-2">
              <Link to="/checkout" className="relative p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all group">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-[2px] border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
             {user ? (
  <div className="relative group">
    <img
      src={user.photoURL || "https://ui-avatars.com/api/?name=User"}
      alt="User avatar"
      className="w-9 h-9 rounded-full border border-slate-200 cursor-pointer"
    />

    {/* Dropdown */}
    <div className="
      absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-slate-100
      opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
      transition-all origin-top-right z-50
    ">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">
          {user.displayName}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {user.email}
        </p>
      </div>

      <button
        onClick={async () => await signOut(auth)}
        className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  </div>
) : (
  <Link
    to="/login"
    className="p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
  >
    <UserIcon className="w-6 h-6" />
  </Link>
)}


            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-[60] pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        <div className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl p-8 pointer-events-auto transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col space-y-10">
            <div className="flex justify-between items-center">
              <Logo size="sm" />
              <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block text-2xl font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-tight"
                  >
                    {link.name}
                  </Link>
                  {link.name === 'CATEGORIES' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <Link 
                          key={cat.id} 
                          to={`/categories?cat=${cat.id}`} 
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest bg-slate-50 p-2 rounded-lg"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)}></div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-[#0f172a] text-white pt-10 pb-4 overflow-hidden relative">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
    <div className="max-w-full mx-auto px-4 sm:px-10 lg:px-16 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="space-y-8">
          <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
            <Logo size="md" />
          </Link>
          <p className="text-slate-400 max-w-xs leading-relaxed font-medium">
            Join thousands of collectors wearing their heart on their sleeve. Premium die-cut badges for the digital generation.
          </p>
        </div>

        <div>
          <h4 className="font-black text-xs tracking-[0.2em] mb-10 text-white/50">ARCHIVE</h4>
          <ul className="space-y-5">
            <li><Link to="/about" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">OUR STORY</Link></li>
            <li><Link to="/categories" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">ALL DROPS</Link></li>
            {/* <li><Link to="/custom-order" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">CUSTOM MOCKUPS</Link></li> */}
          </ul>
        </div>

        <div>
          <h4 className="font-black text-xs tracking-[0.2em] mb-10 text-white/50">SUPPORT</h4>
          <ul className="space-y-5">
            {/* <li><button className="text-sm font-bold text-slate-300 hover:text-white transition-colors">TRACK ORDER</button></li>
            <li><button className="text-sm font-bold text-slate-300 hover:text-white transition-colors">SHIPPING POLICY</button></li> */}
            <li><Link to="/custom-order" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">CUSTOM ORDER</Link></li>
            <li><Link to="/contact" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">GET IN TOUCH</Link></li>

          </ul>
        </div>

     <div>
        <h4 className="font-black text-xs tracking-[0.2em] mb-10 text-white/50">
          FOLLOW
        </h4>

        <div className="flex gap-4">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/sticktoon.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all"
          >
            <Instagram className="w-5 h-5 text-white" />
          </a>

          {/* Mail */}
          <a
            href="mailto:sticktoon.xyz@gmail.com" role = "link"
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all"
          >
            <Mail className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>


      </div>
      <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black tracking-widest text-slate-500 uppercase">
        <span>© 2024 STICKTOON MARKETPLACE</span>
        <div className="flex gap-8">
          {/* <button className="hover:text-white transition-colors">PRIVACY</button>
          <button className="hover:text-white transition-colors">TERMS</button> */}
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);


  const addToCart = (badge: Badge, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === badge.id);
      if (existing) {
        return prev.map(item => item.id === badge.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...badge, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, q: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, q) } : item));
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
     <Navbar
  cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
  user={user}
/>


        <main className="flex-grow pt-24">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/categories" element={<Categories addToCart={addToCart} />} />
            <Route path="/badge/:id" element={<BadgeDetail addToCart={addToCart} />} />
            <Route path="/checkout" element={<Checkout cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/custom-order" element={<CustomOrder addToCart={addToCart} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}