/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import RecycleWizard from './components/RecycleWizard';
import MarketTrends from './components/MarketTrends';
import BottomNav from './components/BottomNav';
import { ChevronLeft } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const isWizard = location.pathname.startsWith('/wizard');
  const showBackButton = location.pathname !== '/';

  const getTitle = () => {
    if (location.pathname === '/market') return '市场行情';
    if (location.pathname === '/profile') return '个人中心';
    if (location.pathname === '/orders') return '我的订单';
    if (location.pathname.startsWith('/wizard')) return '回收评估';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Top Header with Back Button */}
      {showBackButton && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[60] shadow-sm">
          <div className="max-w-7xl mx-auto h-full flex items-center px-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <span className="ml-2 font-bold text-gray-900">{getTitle()}</span>
          </div>
        </div>
      )}

      <main className={showBackButton ? 'pt-14' : ''}>
        <Routes>
          <Route path="/" element={<Home onSelectModel={(model) => navigate(`/wizard/${model}`)} />} />
          <Route path="/market" element={<MarketTrends />} />
          <Route path="/profile" element={<Home onSelectModel={(model) => navigate(`/wizard/${model}`)} showProfileOnly={true} />} />
          <Route path="/orders" element={<div className="p-10 text-center text-gray-400 font-bold">订单模块开发中...</div>} />
          <Route path="/wizard" element={<RecycleWizard onBack={() => navigate('/')} />} />
          <Route path="/wizard/:model" element={<RecycleWizard onBack={() => navigate('/')} />} />
        </Routes>
      </main>

      {!isWizard && (
        <BottomNav />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
