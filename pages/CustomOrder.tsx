import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateBadgeMockup } from '../geminiService.ts';
import { 
  Upload, Wand2, Loader2, CheckCircle2, Sparkles, 
  Image as ImageIcon, X, Box, Type, QrCode, 
  Palette, Layers, User, Info, MousePointer, Eraser, 
  Grid3X3, AlignCenter, AlignVerticalJustifyCenter, FlipHorizontal, FlipVertical,
  RotateCcw, Copy, Clipboard, Lock, Share2, Trash2, Undo2, Redo2, Eye,
  Plus, Minus, Save, ShoppingCart, ChevronDown, Check, Move, RotateCw,
  AlertCircle, Edit3, Ban, FileStack, Files, Maximize2, Minimize2,
  ChevronUp
} from 'lucide-react';
import { formatPrice } from '../constants.tsx';
import { Badge } from '../types.ts';

interface BadgeElement {
  id: string;
  type: 'text' | 'image' | 'qr';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

type InteractionType = 'drag' | 'resize' | 'rotate' | null;

interface CustomOrderProps {
  addToCart: (badge: Badge, quantity?: number) => void;
}

export default function CustomOrder({ addToCart }: CustomOrderProps) {
  const [activeTool, setActiveTool] = useState('model'); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Customization State
  const [fastener, setFastener] = useState('Pin-Badge');
  const [quantity, setQuantity] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [elements, setElements] = useState<BadgeElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [bgColor, setBgColor] = useState('#FFFFFF'); 

  // QR Specific State
  const [qrUrl, setQrUrl] = useState('https://web.whatsapp.com');
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  
  const backgroundPresets = [
    '#TRANSPARENT', '#000000', '#E5E7EB', '#C7D2FE', '#B11494', '#6D28D9',
    '#1E3A8A', '#3B82F6', '#78350F', '#FDE68A', '#991B1B',
    '#EF4444', '#FBCFE8', '#F97316', '#FACC_15', '#FEF08A',
    '#BBF7D0', '#A3E635', '#A1A1AA', '#166534', '#2DD4BF',
    '#0D9488', '#115E59', '#1E293B', '#FFFFFF'
  ];

  const fasteners = [
    { id: 'Pin-Badge', label: 'Pin-Badge' },
    { id: 'Magnetic-Badge', label: 'Magnetic-Badge' }
  ];

  // Interaction State
  const [interaction, setInteraction] = useState<{
    type: InteractionType;
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CANVAS_SIZE = 500; 
  const BASE_PRICE = 69;

  const hexToRgbParams = (hex: string) => {
    if (hex === '#TRANSPARENT') return '255-255-255';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}-${g}-${b}`;
  };

  const handleMouseDown = (e: React.MouseEvent, type: InteractionType, id: string) => {
    e.stopPropagation();
    const elem = elements.find(el => el.id === id);
    if (!elem) return;

    setSelectedId(id);
    setInteraction({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: elem.x,
      startElemY: elem.y,
      startWidth: elem.width,
      startHeight: elem.height,
      startRotation: elem.rotation
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !selectedId) return;
    const dx = e.clientX - interaction.startX;
    const dy = e.clientY - interaction.startY;
    setElements(prev => prev.map(el => {
      if (el.id !== selectedId) return el;
      if (interaction.type === 'drag') return { ...el, x: interaction.startElemX + dx, y: interaction.startElemY + dy };
      if (interaction.type === 'resize') return { ...el, width: Math.max(20, interaction.startWidth + dx), height: Math.max(20, interaction.startHeight + dy) };
      if (interaction.type === 'rotate') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return el;
        const centerX = rect.left + el.x + el.width / 2;
        const centerY = rect.top + el.y + el.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        return { ...el, rotation: (angle * 180) / Math.PI + 90 };
      }
      return el;
    }));
  }, [interaction, selectedId]);

  const handleMouseUp = useCallback(() => setInteraction(null), []);

  useEffect(() => {
    if (interaction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, handleMouseMove, handleMouseUp]);

  const captureCanvasAsDataURL = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.beginPath();
    ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, Math.PI * 2);
    ctx.fillStyle = bgColor === '#TRANSPARENT' ? '#FFFFFF' : bgColor;
    ctx.fill();
    ctx.clip(); 

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      ctx.save();
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-el.width / 2, -el.height / 2);

      if (el.type === 'text') {
        ctx.fillStyle = '#0f172a';
        ctx.font = `black ${el.height * 0.7}px "Plus Jakarta Sans"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.content, el.width / 2, el.height / 2);
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = el.content;
        await new Promise((res) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, el.width, el.height);
            res(null);
          };
          img.onerror = () => res(null);
        });
      }
      ctx.restore();
    }
    return canvas.toDataURL('image/png');
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const dataUrl = await captureCanvasAsDataURL();
      const customBadge: Badge = {
        id: `custom-${Date.now()}`,
        name: `CUSTOM ${fastener.toUpperCase()}`,
        price: BASE_PRICE,
        category: 'Custom',
        image: dataUrl,
        details: `Custom designed ${fastener} badge.`,
        color: 'bg-white'
      };
      addToCart(customBadge, quantity);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const newEl: BadgeElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: textInput,
      x: CANVAS_SIZE / 2 - 50,
      y: CANVAS_SIZE / 2 - 20,
      width: 100,
      height: 40,
      rotation: 0,
      zIndex: elements.length + 1
    };
    setElements([...elements, newEl]);
    setTextInput('');
    setSelectedId(newEl.id);
  };

  const handleScaleElement = (id: string, delta: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      const aspect = el.width / el.height;
      const newWidth = Math.max(20, el.width + delta);
      const newHeight = newWidth / aspect;
      // Keep centered
      const dx = (newWidth - el.width) / 2;
      const dy = (newHeight - el.height) / 2;
      return { ...el, width: newWidth, height: newHeight, x: el.x - dx, y: el.y - dy };
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newEl: BadgeElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      content: url,
      x: CANVAS_SIZE / 2 - 75,
      y: CANVAS_SIZE / 2 - 75,
      width: 150,
      height: 150,
      rotation: 0,
      zIndex: elements.length + 1
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAIUpload = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await generateBadgeMockup(prompt);
      const newEl: BadgeElement = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'image',
        content: url,
        x: 0,
        y: 0,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        rotation: 0,
        zIndex: elements.length + 1
      };
      setElements([...elements, newEl]);
      setSelectedId(newEl.id);
      setPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addQRCode = () => {
    if (!qrUrl.trim()) return;
    const fg = hexToRgbParams(qrFgColor);
    const bg = hexToRgbParams(qrBgColor);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=${fg}&bgcolor=${bg}&margin=1`;
    const newEl: BadgeElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'qr',
      content: url,
      x: CANVAS_SIZE / 2 - 100,
      y: CANVAS_SIZE / 2 - 100,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: elements.length + 1
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const alignCenter = (type: 'h' | 'v') => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => {
      if (el.id !== selectedId) return el;
      return type === 'h' ? { ...el, x: (CANVAS_SIZE - el.width) / 2 } : { ...el, y: (CANVAS_SIZE - el.height) / 2 };
    }));
  };

  const changeLayer = (dir: 'up' | 'down') => {
    if (!selectedId) return;
    setElements(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(el => el.id === selectedId);
      if (idx === -1) return prev;
      if (dir === 'up' && idx < sorted.length - 1) {
        const next = sorted[idx + 1], current = sorted[idx];
        const tempZ = current.zIndex; current.zIndex = next.zIndex; next.zIndex = tempZ;
      } else if (dir === 'down' && idx > 0) {
        const prevEl = sorted[idx - 1], current = sorted[idx];
        const tempZ = current.zIndex; current.zIndex = prevEl.zIndex; prevEl.zIndex = tempZ;
      }
      return [...sorted];
    });
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearCanvas = () => {
    if (confirm('Clear entire design?')) {
      setElements([]);
      setSelectedId(null);
      setBgColor('#FFFFFF');
    }
  };

  const ToolButton = ({ icon: Icon, id, label, count }: { icon: any, id: string, label: string, count?: number }) => (
    <button 
      onClick={() => setActiveTool(id)}
      className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all border-b border-slate-100 relative ${activeTool === id ? 'bg-white text-blue-600 border-r-4 border-r-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-black rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 border border-white shadow-sm">{count}</span>
      )}
    </button>
  );

  const TopBarIcon = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <div className="relative group flex items-center justify-center">
      <button 
        onClick={onClick} 
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all hover:text-blue-600 active:scale-95 flex items-center justify-center"
      >
        <Icon className="w-4 h-4" />
      </button>
      <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-2 group-hover:translate-y-0 z-[100]">
        <div className="bg-[#000000] text-white text-[9px] font-black px-2.5 py-1.5 rounded uppercase tracking-widest whitespace-nowrap shadow-xl flex flex-col items-center relative">
          <div className="w-2.5 h-2.5 bg-[#000000] rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 shadow-sm border-t border-l border-white/5"></div>
          {label}
        </div>
      </div>
    </div>
  );

  // StepperControl updated to use arrows as in SS
  const StepperControl = ({ label, value, onIncrease, onDecrease, unit = "" }: { label: string, value: string|number, onIncrease: () => void, onDecrease: () => void, unit?: string }) => (
    <div className="flex items-center justify-between border border-slate-200 rounded overflow-hidden bg-white h-11">
      <div className="px-4 border-r border-slate-200 flex items-center h-full bg-white flex-shrink-0">
        <span className="text-[11px] font-bold uppercase text-black">{label}</span>
      </div>
      <div className="flex-grow text-center text-sm font-bold text-black bg-white h-full flex items-center justify-center px-2">
        {value}{unit}
      </div>
      <div className="flex flex-col border-l border-slate-200 h-full w-12">
        <button 
          onClick={onIncrease}
          className="flex-1 flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-blue-600 border-b border-slate-100 transition-colors"
          title="Increase"
        >
          <ChevronUp className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
        <button 
          onClick={onDecrease} 
          className="flex-1 flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
          title="Decrease"
        >
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#E5E7EB] overflow-hidden select-none relative">
      {errorMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar Tool Rail */}
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col z-30 shadow-md">
        <ToolButton icon={Box} id="model" label="MODEL" />
        <ToolButton icon={Type} id="text" label="TEXT" />
        <ToolButton icon={ImageIcon} id="image" label="IMAGE" />
        <ToolButton icon={QrCode} id="qr" label="QR" />
        <ToolButton icon={Palette} id="pattern" label="DESIGN" />
        <ToolButton icon={Layers} id="layers" label="LAYERS" count={elements.length} />
        <div className="mt-auto border-t border-slate-100">
          <ToolButton icon={User} id="user" label="USER" />
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 text-center">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {activeTool === 'model' ? 'PIN BACK BUTTON BADGE' : activeTool.toUpperCase()}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-4 flex flex-col space-y-6">
            
            {/* MODEL TAB */}
            {activeTool === 'model' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-800">Fastner:</label>
                  <div className="relative">
                    <select 
                      value={fastener}
                      onChange={(e) => setFastener(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded text-sm text-slate-600 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {fasteners.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center space-y-1 bg-slate-50/30">
                  <div className="text-2xl font-black text-slate-800 tracking-tighter">
                    {formatPrice(BASE_PRICE * quantity)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prices inclusive of taxes</div>
                </div>

                <StepperControl 
                  label="Quantity" 
                  value={quantity} 
                  onIncrease={() => setQuantity(q => q + 1)}
                  onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                />

                <div className="space-y-2 pt-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="w-full h-12 bg-white border border-slate-200 rounded flex items-center justify-center gap-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />} ADD TO CART
                  </button>
                </div>
              </div>
            )}

            {/* DESIGN/PATTERN TAB */}
            {activeTool === 'pattern' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-5 gap-3 px-2">
                  {backgroundPresets.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBgColor(color)}
                      className={`w-10 h-10 rounded-full border border-slate-200 relative shadow-sm hover:scale-110 transition-transform active:scale-95 flex items-center justify-center overflow-hidden ${color === '#TRANSPARENT' ? 'bg-white' : ''}`}
                      style={{ backgroundColor: color === '#TRANSPARENT' ? 'white' : color }}
                    >
                      {color === '#TRANSPARENT' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="w-[1px] h-full bg-red-500 rotate-45 absolute"></div>
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter absolute bottom-1">None</span>
                          {bgColor === '#TRANSPARENT' && (
                             <Check className="w-5 h-5 text-slate-900 z-10 opacity-50" />
                          )}
                        </div>
                      ) : (
                        bgColor.toUpperCase() === color.toUpperCase() && (
                          <Check className={`w-5 h-5 ${color.toUpperCase() === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                        )
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Palette className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Background color</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {bgColor === '#TRANSPARENT' ? 'None' : bgColor}
                      </span>
                      <div className="relative w-12 h-6 rounded border border-slate-300 overflow-hidden">
                        <div className="w-full h-full shadow-inner" style={{ backgroundColor: bgColor === '#TRANSPARENT' ? 'white' : bgColor }}>
                          {bgColor === '#TRANSPARENT' && <div className="absolute inset-0 bg-white flex items-center justify-center"><div className="w-[1px] h-full bg-red-500 rotate-45"></div></div>}
                        </div>
                        <input 
                          type="color" 
                          value={bgColor === '#TRANSPARENT' ? '#FFFFFF' : bgColor} 
                          onChange={(e) => setBgColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="w-full py-3.5 bg-white border border-slate-300 rounded-md flex items-center justify-center gap-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all uppercase shadow-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />} ADD TO CART
                  </button>
                </div>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTool === 'text' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <textarea 
                  value={textInput} 
                  onChange={(e) => setTextInput(e.target.value)} 
                  placeholder="Enter your message..." 
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" 
                />
                
                {selectedId && elements.find(el => el.id === selectedId)?.type === 'text' && (
                  <StepperControl 
                    label="Font Size" 
                    value={Math.round(elements.find(el => el.id === selectedId)!.height)} 
                    onIncrease={() => handleScaleElement(selectedId, 5)}
                    onDecrease={() => handleScaleElement(selectedId, -5)}
                  />
                )}

                <button 
                  onClick={addText} 
                  className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                >
                  Add Text Layer
                </button>
              </div>
            )}

            {/* IMAGE TAB */}
            {activeTool === 'image' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full py-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50/50 group"
                >
                  <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Upload Custom Art</span>
                </button>

                {selectedId && elements.find(el => el.id === selectedId)?.type === 'image' && (
                  <StepperControl 
                    label="Image Size" 
                    value={Math.round(elements.find(el => el.id === selectedId)!.width)} 
                    onIncrease={() => handleScaleElement(selectedId, 10)}
                    onDecrease={() => handleScaleElement(selectedId, -10)}
                  />
                )}

                <div className="pt-6 border-t border-slate-100">
                  {/* <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" /> AI Asset Generator</h3> */}
                  {/* <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="E.g. 'Cyberpunk neon cat head'" 
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" 
                  /> */}
                  {/* <button 
                    onClick={handleAIUpload} 
                    disabled={loading} 
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors"
                  >
                    {loading ? 'Processing...' : 'Generate Asset'}
                  </button> */}
                </div>
              </div>
            )}

            {/* QR TAB */}
            {activeTool === 'qr' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QR Destination Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={qrUrl} 
                      onChange={(e) => setQrUrl(e.target.value)} 
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded text-sm font-bold text-slate-600 focus:outline-none" 
                    />
                    <button onClick={addQRCode} className="w-11 h-11 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>

                {selectedId && elements.find(el => el.id === selectedId)?.type === 'qr' && (
                  <StepperControl 
                    label="QR Code Size" 
                    value={Math.round(elements.find(el => el.id === selectedId)!.width)} 
                    onIncrease={() => handleScaleElement(selectedId, 10)}
                    onDecrease={() => handleScaleElement(selectedId, -10)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-grow flex flex-col relative" onMouseDown={() => setSelectedId(null)}>
        {/* Top Toolbar */}
        {/* <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-1 justify-center z-40 shadow-sm overflow-visible">
          <TopBarIcon icon={Info} label="Info" />
          <TopBarIcon icon={MousePointer} label="Select" />
          <TopBarIcon icon={Eraser} label="Clear Design" onClick={clearCanvas} />
          <TopBarIcon icon={Grid3X3} label="Toggle Grid" />
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <TopBarIcon icon={AlignCenter} label="Align Horizontal" onClick={() => alignCenter('h')} />
          <TopBarIcon icon={AlignVerticalJustifyCenter} label="Align Vertical" onClick={() => alignCenter('v')} />
          <TopBarIcon icon={FlipHorizontal} label="Flip Horizontal" />
          <TopBarIcon icon={FlipVertical} label="Flip Vertical" />
          <TopBarIcon icon={RotateCcw} label="Rotate Reset" />
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <TopBarIcon icon={Files} label="Bring to Front" onClick={() => changeLayer('up')} />
          <TopBarIcon icon={FileStack} label="Send to Back" onClick={() => changeLayer('down')} />
          <TopBarIcon icon={Lock} label="Lock Layer" />
          <TopBarIcon icon={Share2} label="Share Design" />
          <TopBarIcon icon={Copy} label="Duplicate Object" />
          <TopBarIcon icon={Trash2} label="Delete Object" onClick={() => selectedId && removeElement(selectedId)} />
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <TopBarIcon icon={Undo2} label="Undo Change" />
          <TopBarIcon icon={Redo2} label="Redo Change" />
          <TopBarIcon icon={Eye} label="Preview" />
        </div> */}

        <div className="flex-grow relative flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="text-center mb-6 max-w-sm">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               Please keep all artworks inside the dashed line.<br/> Any artwork beyond the dashed line will get cut.
             </p>
          </div>

          <div className="relative" ref={canvasRef}>
            <div className="absolute inset-0 bg-slate-900/10 rounded-full blur-[40px] translate-y-8 scale-110"></div>
            
            <div 
              className="w-[500px] h-[500px] rounded-full relative shadow-2xl border-[12px] border-white overflow-hidden flex items-center justify-center transition-colors duration-300" 
              style={{ backgroundColor: bgColor === '#TRANSPARENT' ? '#FFFFFF' : bgColor }}
            >
              <div className="absolute inset-5 border-[3px] border-dashed border-white/30 rounded-full z-20 pointer-events-none"></div>
              
              <div className="w-full h-full relative z-10">
                {elements.sort((a,b) => a.zIndex - b.zIndex).map((el) => {
                  const isSelected = selectedId === el.id;
                  return (
                    <div 
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(e, 'drag', el.id)}
                      className={`absolute group cursor-move ${isSelected ? 'z-[999]' : ''}`}
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        transform: `rotate(${el.rotation}deg)`,
                        zIndex: el.zIndex
                      }}
                    >
                      {isSelected && (
                        <div className="absolute -inset-1 border-2 border-blue-400 pointer-events-none">
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg hover:bg-red-600 active:scale-90 transition-all z-[1001]" onMouseDown={(e) => { e.stopPropagation(); removeElement(el.id); }}><X className="w-3.5 h-3.5" /></div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border border-blue-400 flex items-center justify-center cursor-alias pointer-events-auto shadow-md" onMouseDown={(e) => handleMouseDown(e, 'rotate', el.id)}><RotateCw className="w-3.5 h-3.5 text-blue-400" /></div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-sm cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleMouseDown(e, 'resize', el.id)}></div>
                        </div>
                      )}
                      <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        {el.type === 'text' ? (
                          <div className="font-black text-slate-900 text-center leading-tight whitespace-nowrap select-none" style={{ fontSize: `${el.height * 0.7}px` }}>{el.content}</div>
                        ) : (
                          <img src={el.content} className="w-full h-full object-contain pointer-events-none select-none" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pin-button-dome opacity-30 z-30 pointer-events-none"></div>
            </div>
          </div>
          <div className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-40">PROFESSIONAL 58MM BADGE TEMPLATE</div>
        </div>
      </div>
    </div>
  );
}