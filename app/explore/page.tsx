'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Clock, Wallet } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DESTINATIONS, LOCAL_ACTIVITIES } from '@/lib/travel';
import { BudgetLevel, TravelCategory, TravelDestination } from '@/lib/types';
import { getCountry } from '@/lib/countries';

const CATEGORIES: { value: TravelCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌍' },
  { value: 'weekend', label: 'Weekend', emoji: '🌅' },
  { value: 'city', label: 'City', emoji: '🏙️' },
  { value: 'nature', label: 'Nature', emoji: '🌿' },
  { value: 'international', label: 'International', emoji: '✈️' },
];

const BUDGETS: { value: BudgetLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Any budget' },
  { value: 'low', label: 'Budget' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'high', label: 'Premium' },
];

export default function ExplorePage() {
  const { profile } = useAppStore();
  const country = getCountry(profile.countryCode);
  const region = country?.region ?? 'europe';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TravelCategory | 'all'>('all');
  const [budget, setBudget] = useState<BudgetLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'destinations' | 'activities'>('destinations');

  const filtered = useMemo(() => {
    const budgetOrder: BudgetLevel[] = ['low', 'mid', 'high'];

    return DESTINATIONS.filter(d => {
      const matchesRegion = d.regions.includes(region);
      const matchesCategory = category === 'all' || d.category === category;
      const matchesBudget =
        budget === 'all' ||
        budgetOrder.indexOf(d.budgetLevel) <= budgetOrder.indexOf(budget as BudgetLevel);
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.country.toLowerCase().includes(search.toLowerCase()) ||
        d.tagline.toLowerCase().includes(search.toLowerCase());

      return matchesRegion && matchesCategory && matchesBudget && matchesSearch;
    });
  }, [region, category, budget, search]);

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Explore</h1>
        <p className="text-sm text-gray-400">Destination ideas for your time off</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search destinations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0"
          style={{ color: showFilters ? '#4D7C52' : '#9CA3AF' }}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Budget</p>
          <div className="flex gap-2 flex-wrap">
            {BUDGETS.map(b => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: budget === b.value ? '#4D7C52' : '#F5F0E8',
                  color: budget === b.value ? 'white' : '#6B7280',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {(['destinations', 'activities'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-full text-sm font-medium capitalize transition-all"
            style={{
              background: activeTab === tab ? '#4D7C52' : 'white',
              color: activeTab === tab ? 'white' : '#6B7280',
              border: activeTab === tab ? 'none' : '1px solid #F5F0E8',
            }}
          >
            {tab === 'destinations' ? '✈️ Destinations' : '🏃 Local Activities'}
          </button>
        ))}
      </div>

      {activeTab === 'destinations' && (
        <>
          {/* Category pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: category === c.value ? '#4D7C52' : 'white',
                  color: category === c.value ? 'white' : '#6B7280',
                  border: category === c.value ? 'none' : '1px solid #F5F0E8',
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Destination grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <p className="text-2xl">🗺️</p>
              <p className="font-semibold text-gray-700">No destinations found</p>
              <p className="text-sm text-gray-400">Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((dest, i) => (
                <DestinationCard key={dest.id} dest={dest} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-2">
          {LOCAL_ACTIVITIES.map((act, i) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: '#F5F0E8' }}
              >
                {act.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{act.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} /> {act.duration}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: '#EDF5ED', color: '#4D7C52' }}
                  >
                    {act.bestTime.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function DestinationCard({ dest, index }: { dest: TravelDestination; index: number }) {
  const budgetColors: Record<BudgetLevel, { bg: string; text: string; label: string }> = {
    low: { bg: '#EDF5ED', text: '#4D7C52', label: 'Budget-friendly' },
    mid: { bg: '#EBF4FA', text: '#3D85AE', label: 'Mid-range' },
    high: { bg: '#FAE8E3', text: '#D96B5B', label: 'Premium' },
  };
  const bCfg = budgetColors[dest.budgetLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer"
    >
      {/* Header strip */}
      <div
        className="h-2 w-full"
        style={{
          background: dest.category === 'nature'
            ? 'linear-gradient(90deg, #6B9E6B, #B3CEB3)'
            : dest.category === 'city'
            ? 'linear-gradient(90deg, #5FA0C5, #8BBDD8)'
            : dest.category === 'international'
            ? 'linear-gradient(90deg, #D96B5B, #F0A090)'
            : 'linear-gradient(90deg, #D97706, #F59E0B)',
        }}
      />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: '#F5F0E8' }}
          >
            {dest.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-gray-800">{dest.name}</p>
                <p className="text-xs text-gray-400">{dest.country}</p>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: bCfg.bg, color: bCfg.text }}
              >
                {bCfg.label}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{dest.tagline}&rdquo;</p>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{dest.description}</p>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-beige-100">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">{dest.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500 capitalize">{dest.budgetLevel}</span>
          </div>
          <div className="flex gap-1 ml-auto">
            {dest.bestFor.slice(0, 2).map(b => (
              <span
                key={b}
                className="text-xs px-2 py-0.5 rounded-full capitalize"
                style={{ background: '#F5F0E8', color: '#9CA3AF' }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
