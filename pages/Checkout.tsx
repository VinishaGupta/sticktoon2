
import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { FileText, MapPin, Phone, User, Trash2, ShieldCheck, ChevronRight, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../constants';

interface CheckoutProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, q: number) => void;
}

export default function Checkout({ cart, removeFromCart, updateQuantity }: CheckoutProps) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharges = subtotal > 0 ? 99 : 0;
  const discount = subtotal > 1000 ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryCharges - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-12 animate-in fade-in zoom-in duration-700">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-20 scale-150"></div>
          <div className="relative w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center border-4 border-slate-100 shadow-inner">
             <ShoppingCart className="w-24 h-24 text-slate-200" strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-10 max-w-sm text-lg font-medium leading-relaxed">
          Looks like you haven't added any badges to your collection yet. Start shopping to fill it up!
        </p>
        
        <Link 
          to="/categories" 
          aria-label="Go to Categories page"
          className="bg-blue-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all text-lg inline-flex items-center gap-2 group"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-full mx-auto px-4 sm:px-10 lg:px-20">
        <h1 className="text-4xl font-black text-slate-900 mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Details */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Deliver to:</h3>
                <button className="text-blue-600 font-bold hover:underline">Change</button>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-6 border-2 border-blue-100 space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-bold">John Doe</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>123 Sticker Lane, Creative District, Mumbai 400001</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>+91 (555) 012-3456</span>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8">Your Items ({cart.length})</h3>
              <div className="space-y-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-8 pb-8 border-b border-slate-50 last:border-0">
                    <div className="relative w-24 h-24 flex-shrink-0">
                       <div className="pin-button-3d pin-shadow w-full h-full overflow-hidden bg-white">
                          <div className="pin-button-dome opacity-40"></div>
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{item.name}</h4>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                        <span className="text-xl font-black text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold hover:bg-blue-50 transition-colors">-</button>
                          <span className="w-4 text-center font-black text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold hover:bg-blue-50 transition-colors">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">Price Details (INR)</h3>
                <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  <FileText className="w-4 h-4" /> View Invoice
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span className="font-medium">Vibe Member Discount</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span className="font-medium">Express Delivery</span>
                  <span className="font-bold text-slate-800">{formatPrice(deliveryCharges)}</span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between">
                  <span className="text-lg font-black text-slate-900">Grand Total</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl mb-8 flex items-start gap-4 border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                <p className="text-[11px] text-emerald-800 font-bold leading-tight">Your purchase is protected by StickToon Buyer Guarantee.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border-2 border-slate-50 hover:border-blue-200 bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm uppercase">Cash on Delivery</h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Pay in cash or UPI on arrival</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                  </div>
                </div>

                <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-widest uppercase text-xs">
                  Place Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
