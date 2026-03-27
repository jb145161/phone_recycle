import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const TREND_DATA = [
  { date: '03-20', price: 6200 },
  { date: '03-21', price: 6150 },
  { date: '03-22', price: 6300 },
  { date: '03-23', price: 6250 },
  { date: '03-24', price: 6400 },
  { date: '03-25', price: 6350 },
  { date: '03-26', price: 6500 },
];

const MARKET_ITEMS = [
  { id: '1', name: 'iPhone 16 Pro Max', price: 8499, change: '+2.4%', trend: 'up', volume: '1.2W+' },
  { id: '2', name: 'iPhone 16 Pro', price: 7299, change: '-1.2%', trend: 'down', volume: '8.5K+' },
  { id: '3', name: 'iPhone 15 Pro Max', price: 6499, change: '+0.8%', trend: 'up', volume: '2.1W+' },
  { id: '4', name: 'Huawei Mate 60 Pro', price: 5899, change: '+4.2%', trend: 'up', volume: '1.5W+' },
  { id: '5', name: 'Xiaomi 14 Ultra', price: 5299, change: '-0.5%', trend: 'down', volume: '6.2K+' },
  { id: '6', name: 'Samsung S24 Ultra', price: 7499, change: '+1.5%', trend: 'up', volume: '4.8K+' },
];

export default function MarketTrends() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-6 rounded-b-[32px] shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">市场行情</h1>
            <div className="flex items-center gap-2 text-[#07C160] bg-green-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">实时更新</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索机型，查看价格趋势"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 h-12 pl-11 pr-4 rounded-xl text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Main Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">iPhone 16 Pro Max Index</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">¥8,499</span>
                <span className="text-xs font-bold text-[#07C160] flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +2.4%
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-lg">7D</button>
              <button className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">30D</button>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#07C160" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#07C160" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#07C160" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                <Info className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-gray-500">建议：当前价格处于高位，适合卖出</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </motion.div>

        {/* Market List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-gray-900">热门机型行情</h2>
            <button className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              近7日涨跌
            </button>
          </div>

          <div className="space-y-3">
            {MARKET_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.trend === 'up' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {item.trend === 'up' ? (
                      <TrendingUp className={`w-5 h-5 ${item.trend === 'up' ? 'text-[#07C160]' : 'text-red-500'}`} />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">成交 {item.volume}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-gray-900">¥{item.price}</div>
                  <div className={`text-[10px] font-bold flex items-center justify-end ${item.trend === 'up' ? 'text-[#07C160]' : 'text-red-500'}`}>
                    {item.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                    {item.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
