
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BADGES, formatPrice } from '../constants';
import { Badge } from '../types';
import { getBadgeDescription } from '../geminiService';
import { ShoppingCart, Zap, Shield, RotateCcw, ArrowLeft, Star, Heart, Truck } from 'lucide-react';

interface BadgeDetailProps {
  addToCart: (badge: Badge) => void;
}

export default function BadgeDetail({ addToCart }: BadgeDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const badge = BADGES.find(b => b.id === id);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [badgeType, setBadgeType] = useState<'pin' | 'magnetic'>('pin');


  useEffect(() => {
    if (badge) {
      getBadgeDescription(badge.name).then(setDescription);
    }
  }, [badge]);

  if (!badge) {
    return <div className="p-20 text-center">Badge not found</div>;
  }

  const handleBuyNow = () => {
    addToCart(badge);
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
    <div className="w-full px-6 py-12">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image side */}
          <div className="space-y-6">
           <div className="relative flex items-center justify-center">

            {/* <div className="pin-button-3d pin-shadow w-full h-full overflow-hidden animate-float-badge flex items-center justify-center bg-white"> */}
                {/* <div className="pin-button-dome"></div> */}
              {/* <img
                src={badge.image}
                alt={badge.name}
                className="w-full max-w-[420px] h-auto object-contain"
               /> */}
              </div>
              {/* <div className="absolute top-6 left-6 bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 shadow border border-slate-100">
               <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-black text-slate-800">
                 4.9 (124 reviews)
                 </span>
              </div> */}
            {/* </div> */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center">
  <img
    src={badge.image}
    alt={badge.name}
    className="w-full max-w-[360px] h-auto object-contain"
  />
</div>

            {/* <div className="grid grid-cols-3 gap-6 px-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-white rounded-full p-2 pin-shadow border border-slate-100 hover:scale-110 transition-transform cursor-pointer overflow-hidden opacity-60 hover:opacity-100 flex items-center justify-center">
                   <div className="pin-button-dome opacity-30"></div>
                   <img src={badge.image} className="w-full h-full object-cover rounded-full" alt="view" />
                </div>
              ))}
            </div> */}
            
          </div>

          {/* Details side */}
          <div className="space-y-8 lg:pl-8">
            <div>
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{badge.category}</span>
              <div className="flex justify-between items-center mt-2">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">{badge.name}</h1>
               <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">

                  <Heart className="w-6 h-6 fill-current" />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{formatPrice(badge.price)}</span>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-400 line-through font-bold">{formatPrice(799)}</span>
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block">50% OFF</span>
                </div>
              </div>
            </div>

           <div className="space-y-4">
  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
    Choose Badge Style
  </h3>

  <div className="grid grid-cols-2 gap-4">
    {/* Pin Badge */}
    <button
      onClick={() => setBadgeType('pin')}
      className={`p-4 rounded-xl border-2 text-sm font-black transition-all
        ${badgeType === 'pin'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-200 hover:border-slate-400'
        }`}
    >
      Pin Badge
    </button>

    {/* Magnetic Badge */}
    <button
      onClick={() => setBadgeType('magnetic')}
      className={`p-4 rounded-xl border-2 text-sm font-black transition-all
        ${badgeType === 'magnetic'
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-200 hover:border-slate-400'
        }`}
    >
      Magnetic Badge
    </button>
  </div>

  <p className="text-xs text-slate-400">
    {badgeType === 'pin'
      ? 'Classic pin-back badge'
      : 'No-pin, fabric-safe magnetic badge'}
  </p>
</div>


            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl hover:bg-blue-50 transition-colors">-</button>
                <span className="w-8 text-center font-black text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl hover:bg-blue-50 transition-colors">+</button>
              </div>
              <p className="text-xs font-bold text-slate-400">Limited Edition Batch<br /> <span className="text-rose-500">Only 12 left!</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => addToCart(badge)}
                className="py-5 bg-white border-4 border-slate-900 text-slate-900 font-black rounded-[1.5rem] hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                <Zap className="w-6 h-6 fill-current" /> Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-12 border-t border-slate-100">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <Truck className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Free Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Easy 7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
