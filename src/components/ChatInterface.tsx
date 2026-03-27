import React, { useState, useRef, useEffect } from 'react';
import { Send, Smartphone, ShieldCheck, History, Lock, Monitor, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithExpert, calculatePrice } from '../services/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
  isPriceCard?: boolean;
  priceData?: any;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '您好！我是您的二手手机评估专家。请问您是想了解一下您手机的回收价值吗？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMessage } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const result = await chatWithExpert(history);
      const response = await result;

      if (response.functionCalls) {
        const call = response.functionCalls[0];
        if (call.name === 'calculate_price') {
          const price = calculatePrice(call.args as any);
          const priceText = price 
            ? `根据您的描述，初步评估价格为：¥${price}` 
            : "抱歉，由于您的手机存在账号锁，我们暂时无法提供在线报价。建议您解锁后再试。";
          
          setMessages(prev => [
            ...prev, 
            { 
              role: 'model', 
              text: priceText,
              isPriceCard: !!price,
              priceData: call.args
            }
          ]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || '...' }]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : '系统繁忙，请稍后再试。';
      setMessages(prev => [...prev, { role: 'model', text: `抱歉，${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <div>
            <h1 className="text-base font-semibold text-gray-800">二手手机评估专家</h1>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#07c160] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
              }`}>
                {msg.isPriceCard ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#07c160] font-bold border-b border-green-50 pb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>评估报告单</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {msg.priceData.model}</div>
                      <div className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {msg.priceData.storage}</div>
                      <div className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {msg.priceData.screen}</div>
                      <div className="flex items-center gap-1"><History className="w-3 h-3" /> {msg.priceData.repair}</div>
                    </div>
                    <div className="pt-2">
                      <div className="text-gray-400 text-[10px]">预估回收价</div>
                      <div className="text-2xl font-black text-[#ff4d4f]">
                        <span className="text-sm">¥</span>{msg.text.match(/\d+/)?.[0]}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 italic">
                      * 最终价格以实机检测为准，报价24小时内有效
                    </div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 rounded-tl-none border border-gray-50 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100 pb-8">
        <div className="flex items-center gap-2 bg-[#f7f7f7] rounded-full px-4 py-2 focus-within:ring-1 ring-[#07c160] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="描述您的手机情况..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-1"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-1.5 rounded-full transition-colors ${
              input.trim() && !loading ? 'bg-[#07c160] text-white' : 'text-gray-300'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-around mt-4">
          <QuickAction icon={<Smartphone className="w-4 h-4" />} label="型号" />
          <QuickAction icon={<Monitor className="w-4 h-4" />} label="屏幕" />
          <QuickAction icon={<History className="w-4 h-4" />} label="维修" />
          <QuickAction icon={<Lock className="w-4 h-4" />} label="账号" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
      <div className="p-2 bg-gray-50 rounded-xl">
        {icon}
      </div>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
