/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Home from './components/Home';
import RecycleWizard from './components/RecycleWizard';
import MarketTrends from './components/MarketTrends';
import BottomNav from './components/BottomNav';

export default function App() {
  const [view, setView] = useState<'home' | 'market' | 'wizard'>('home');
  const [selectedModel, setSelectedModel] = useState<string | undefined>();

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    setView('wizard');
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedModel(undefined);
  };

  const handleTabChange = (tab: 'home' | 'market' | 'orders' | 'profile') => {
    if (tab === 'home') setView('home');
    if (tab === 'market') setView('market');
    // Orders and Profile can be added later, for now we stay on current or show placeholder
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <main>
        {view === 'home' && <Home onSelectModel={handleSelectModel} />}
        {view === 'market' && <MarketTrends />}
        {view === 'wizard' && (
          <RecycleWizard initialModel={selectedModel} onBack={handleBackToHome} />
        )}
      </main>

      {view !== 'wizard' && (
        <BottomNav 
          activeTab={view === 'home' ? 'home' : 'market'} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
}
