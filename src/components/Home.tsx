import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  TrendingUp, 
  Smartphone, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Coins,
  Tablet,
  Laptop,
  Watch,
  Camera,
  Flame
} from 'lucide-react';

interface HomeProps {
  onSelectModel: (model: string) => void;
}

const CATEGORIES = [
  { id: 'phone', label: '手机', icon: <Smartphone className="w-6 h-6" />, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'tablet', label: '平板', icon: <Tablet className="w-6 h-6" />, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'laptop', label: '电脑', icon: <Laptop className="w-6 h-6" />, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'watch', label: '手表', icon: <Watch className="w-6 h-6" />, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'camera', label: '相机', icon: <Camera className="w-6 h-6" />, color: 'text-red-500', bg: 'bg-red-50' },
];

const POPULAR_MODELS = [
  { id: 'iPhone 15 Pro Max', label: 'iPhone 15 Pro Max', price: '6580', tag: '最高加价200', img: 'https://picsum.photos/seed/iphone15promax/300/300' },
  { id: 'Mate 60 Pro', label: 'Mate 60 Pro', price: '5240', tag: '热门回收', img: 'https://picsum.photos/seed/mate60pro/300/300' },
  { id: 'iPhone 14 Pro', label: 'iPhone 14 Pro', price: '4850', tag: '保值王', img: 'https://picsum.photos/seed/iphone14pro/300/300' },
  { id: 'Xiaomi 14 Ultra', label: '小米 14 Ultra', price: '4120', tag: '极速成交', img: 'https://picsum.photos/seed/xiaomi14ultra/300/300' },
];

const TRANSACTIONS = [
  "尾号 8291 的用户 刚刚成交 iPhone 15 Pro ¥6100",
  "尾号 3302 的用户 刚刚成交 Mate 60 ¥4800",
  "尾号 1198 的用户 刚刚成交 iPad Pro ¥3200",
  "尾号 5543 的用户 刚刚成交 MacBook Air ¥5500",
];

export default function Home({ onSelectModel }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % TRANSACTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filteredModels = POPULAR_MODELS.filter(m => 
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24 font-sans">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-50 bg-[#07C160] px-4 pt-6 md:pt-10 pb-5 md:pb-6 rounded-b-[32px] md:rounded-b-[40px] shadow-xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-lg border border-white/10">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg md:text-2xl leading-tight tracking-tight">专业回收报价</h1>
                <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                  <span className="bg-white/20 text-white text-[8px] md:text-xs px-1.5 py-0.5 rounded-md font-bold backdrop-blur-sm">官方认证</span>
                  <span className="bg-white/20 text-white text-[8px] md:text-xs px-1.5 py-0.5 rounded-md font-bold backdrop-blur-sm">极速打款</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-[9px] md:text-xs font-bold uppercase tracking-wider">Users Served</div>
              <div className="text-white font-black text-base md:text-2xl leading-none">120W+</div>
            </div>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="输入手机型号，立即获取专业报价"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white h-12 md:h-14 pl-11 pr-4 rounded-xl md:rounded-2xl text-sm md:text-base shadow-inner focus:outline-none focus:ring-4 focus:ring-green-400/20 transition-all placeholder:text-gray-300"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#07C160] text-white px-4 md:px-6 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold active:scale-95 transition-transform shadow-lg shadow-green-900/20">
              获取报价
            </button>
          </div>

          {/* Header Stats Bar */}
          <div className="flex justify-between mt-4 md:mt-6 px-1 md:px-2 max-w-2xl mx-auto">
            <div className="flex flex-col">
              <span className="text-white/50 text-[9px] md:text-xs font-bold uppercase">Avg. Premium</span>
              <span className="text-white font-black text-sm md:text-base">+25%</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-white/50 text-[9px] md:text-xs font-bold uppercase">Inspection</span>
              <span className="text-white font-black text-sm md:text-base">360° Pro</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-white/50 text-[9px] md:text-xs font-bold uppercase">Payment</span>
              <span className="text-white font-black text-sm md:text-base">1H Fast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Real-time Ticker */}
        <div className="px-6 py-3 bg-white/50 backdrop-blur-sm flex items-center gap-2 overflow-hidden">
          <div className="bg-green-50 text-[#07C160] text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 fill-current" /> 动态
          </div>
          <div className="h-5 overflow-hidden flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[11px] md:text-sm text-gray-500 font-medium truncate"
              >
                {TRANSACTIONS[tickerIdx]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Service Guarantees */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-3xl p-5 flex justify-between items-center shadow-sm border border-gray-50">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-2xl flex items-center justify-center text-[#07C160]">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">官方质检</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <Truck className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">顺丰包邮</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <Coins className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700">极速打款</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 mt-6">
          <div className="flex justify-between md:justify-around gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} className="flex flex-col items-center gap-1.5 group">
                <div className={`${cat.bg} ${cat.color} w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition-transform`}>
                  {React.cloneElement(cat.icon as React.ReactElement, { className: "w-5 h-5 md:w-10 md:h-10" })}
                </div>
                <span className="text-[10px] md:text-sm font-bold text-gray-600">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* High Price Section */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#07C160] rounded-full" />
              <h2 className="text-lg md:text-xl font-black text-gray-900 italic">高价回收榜</h2>
              <Flame className="w-5 h-5 text-orange-500 fill-current" />
            </div>
            <button className="text-xs md:text-sm text-gray-400 font-bold flex items-center">
              更多 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-6">
            {(searchQuery ? filteredModels : POPULAR_MODELS).map((model, idx) => (
              <motion.button
                key={model.id}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectModel(model.id)}
                className="bg-white p-0 rounded-[20px] md:rounded-[28px] text-left shadow-sm border border-gray-50 overflow-hidden group flex flex-col"
              >
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                  <img 
                    src={model.img} 
                    alt={model.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[8px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {model.tag}
                  </div>
                </div>
                
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-gray-800 text-xs md:text-base mb-0.5 md:mb-1 leading-tight line-clamp-1">{model.label}</div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[9px] md:text-xs text-[#07C160] font-bold">¥</span>
                      <span className="text-base md:text-xl text-[#07C160] font-black">{model.price}</span>
                      <span className="text-[9px] md:text-xs text-gray-300 ml-0.5 md:l-1 font-bold">起</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 md:mt-3 flex justify-between items-center">
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Professional</div>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-900 text-white rounded-full flex items-center justify-center">
                      <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          {searchQuery && filteredModels.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>未找到相关机型，试试其他关键词</p>
            </div>
          )}
        </div>

        {/* Big CTA Banner */}
        <div className="px-4 mt-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#07C160]" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Market Trend</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-black mb-2 italic">旧机换新，最高加价 ¥800</h3>
              <p className="text-white/50 text-xs md:text-sm mb-6 max-w-[200px] md:max-w-md">专业质检报告，价格透明不压价，顺丰上门取件。</p>
              <button className="bg-[#07C160] text-white px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-sm md:text-base shadow-lg shadow-green-500/20 active:scale-95 transition-transform">
                立即加价回收
              </button>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 md:w-80 md:h-80 bg-[#07C160]/10 rounded-full blur-3xl" />
            <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full blur-2xl" />
            
            <Smartphone className="absolute right-4 bottom-4 w-24 h-24 md:w-48 md:h-48 text-white/5 -rotate-12" />
          </div>
        </div>
      </div>

    </div>
  );
}
