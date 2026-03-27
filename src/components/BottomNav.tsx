import React from 'react';
import { Smartphone, TrendingUp, Zap, Truck, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'market' | 'orders' | 'profile';
  onTabChange: (tab: 'home' | 'market' | 'orders' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 md:px-8 flex justify-between items-center z-50">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 ${activeTab === 'home' ? 'text-[#07C160]' : 'text-gray-300'} cursor-pointer`}
        >
          <Smartphone className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] md:text-[10px] font-bold">首页</span>
        </button>
        <button 
          onClick={() => onTabChange('market')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 ${activeTab === 'market' ? 'text-[#07C160]' : 'text-gray-300'} cursor-pointer`}
        >
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] md:text-[10px] font-bold">行情</span>
        </button>
        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#07C160] rounded-full -mt-8 md:-mt-10 border-4 border-white flex items-center justify-center shadow-lg shadow-green-500/30 text-white active:scale-90 transition-transform cursor-pointer">
          <Zap className="w-6 h-6 md:w-7 md:h-7 fill-current" />
        </div>
        <button 
          onClick={() => onTabChange('orders')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 ${activeTab === 'orders' ? 'text-[#07C160]' : 'text-gray-300'} cursor-pointer`}
        >
          <Truck className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] md:text-[10px] font-bold">订单</span>
        </button>
        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-0.5 md:gap-1 ${activeTab === 'profile' ? 'text-[#07C160]' : 'text-gray-300'} cursor-pointer`}
        >
          <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] md:text-[10px] font-bold">我的</span>
        </button>
      </div>
    </div>
  );
}
