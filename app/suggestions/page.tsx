'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CalendarDays, TrendingUp, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { fetchPublicHolidays, formatDate } from '@/lib/holidays';
import { generateOptimizations } from '@/lib/optimizer';
import { LeaveOptimization, OptimizationType } from '@/lib/types';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

const TYPE_CONFIG: Record<OptimizationType, { label: string; bg: string; text: string; icon: string }> = {
  'long-weekend': { label: 'Long Weekend', bg: '#EBF4FA', text: '#3D85AE', icon: '🌊' },
  bridge: { label: 'Bridge Days', bg: '#EDF5ED', text: '#4D7C52', icon: '🌉' },
  cluster: { label: 'Cluster', bg: '#FEF3C7', text: '#D97706', icon: '⭐' },
  'week-stretch': { label: 'Week Stretch', bg: '#FAE8E3', text: '#D96B5B', icon: '🚀' },
};

export default function SuggestionsPage() {
  const { profile, publicHolidays, optimizations, selectedYear, setPublicHolidays, setOptimizations } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<OptimizationType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const remaining = profile.leaveBalance - profile.usedLeave;

  async function refresh() {
    setLoading(true);
    const holidays = await fetchPublicHolidays(profile.countryCode, selectedYear);
    setPublicHolidays(holidays);
    const opts = generateOptimizations(
      selectedYear, holidays, profile.companyHolidays, profile.leaveBalance, profile.blockedDates
    );
    setOptimizations(opts);
    setLoading(false);
  }

  useEffect(() => {
    if (optimizations.length === 0) refresh();
  }, []);

  const filtered = filter === 'all' ? optimizations : optimizations.filter(o => o.type === filter);
  const totalPotentialDays = optimizations.reduce((s, o) => s + o.totalDaysOff, 0);
  const avgEfficiency = optimizations.length > 0
    ? (optimizations.reduce((s, o) => s + o.efficiency, 0) / optimizations.length).toFixed(1)
    : '0';

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Leave Plans</h1>
          <p className="text-sm text-gray-400">AI-optimized opportunities for {selectedYear}</p>
        </div>
        <button
          onClick={refresh}
          className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center"
          disabled={loading}
        >
          <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5 mt-4">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold" style={{ color: '#4D7C52' }}>{remaining}</p>
          <p className="text-xs text-gray-400 mt-0.5">Days left</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold" style={{ color: '#3D85AE' }}>{totalPotentialDays}</p>
          <p className="text-xs text-gray-400 mt-0.5">Potential off</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold" style={{ color: '#D97706' }}>{avgEfficiency}×</p>
          <p className="text-xs text-gray-400 mt-0.5">Avg efficiency</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
        {(['all', 'long-weekend', 'bridge', 'cluster', 'week-stretch'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === f ? '#4D7C52' : 'white',
              color: filter === f ? 'white' : '#6B7280',
              border: filter === f ? 'none' : '1px solid #F5F0E8',
            }}
          >
            {f === 'all' ? 'All' : TYPE_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#B3CEB3', borderTopColor: '#4D7C52' }} />
          <p className="text-sm text-gray-400">Calculating optimizations…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#EDF5ED' }}>🗓️</div>
          <p className="font-semibold text-gray-700">No opportunities found</p>
          <p className="text-sm text-gray-400 max-w-xs">Try adjusting your leave balance or removing blocked dates in Settings.</p>
        </div>
      )}

      {/* Optimization cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map((opt, i) => (
            <OptimizationDetailCard
              key={opt.id}
              opt={opt}
              index={i}
              expanded={expandedId === opt.id}
              onToggle={() => setExpandedId(expandedId === opt.id ? null : opt.id)}
              leaveRemaining={remaining}
              publicHolidays={publicHolidays}
              companyHolidays={profile.companyHolidays}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OptimizationDetailCard({
  opt, index, expanded, onToggle, leaveRemaining, publicHolidays, companyHolidays,
}: {
  opt: LeaveOptimization;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  leaveRemaining: number;
  publicHolidays: { date: string; name: string }[];
  companyHolidays: { date: string; name: string }[];
}) {
  const cfg = TYPE_CONFIG[opt.type];
  const canAfford = opt.leaveDaysUsed <= leaveRemaining;

  // Build day-by-day breakdown
  const allDays = eachDayOfInterval({ start: parseISO(opt.startDate), end: parseISO(opt.endDate) });
  const allHolidayDates = new Set([...publicHolidays, ...companyHolidays].map(h => h.date));
  const leaveDates = new Set(opt.leaveDaysNeeded);
  const allHolidayMap = new Map([...publicHolidays, ...companyHolidays].map(h => [h.date, h.name]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <button className="w-full text-left p-4" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: cfg.bg }}
          >
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
                {cfg.label}
              </span>
              {!canAfford && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-400">
                  Insufficient balance
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 mb-0.5">{opt.description}</p>
            <p className="text-xs text-gray-400">
              {formatDate(opt.startDate, 'MMM d')} – {formatDate(opt.endDate, 'MMM d yyyy')}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-xl font-bold" style={{ color: '#4D7C52' }}>{opt.efficiency}×</p>
            <p className="text-xs text-gray-400">{opt.leaveDaysUsed}d leave</p>
          </div>
        </div>

        {/* Mini stat row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-beige-100">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">{opt.totalDaysOff} days off total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">{opt.leaveDaysUsed} days leave used</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">{opt.efficiency}× multiplier</span>
          </div>
          <div className="ml-auto">
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>
      </button>

      {/* Expanded breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="pt-3 border-t border-beige-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Day-by-day breakdown</p>
                <div className="space-y-1">
                  {allDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayOfWeek = day.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isHoliday = allHolidayDates.has(dateStr);
                    const isLeave = leaveDates.has(dateStr);
                    const holidayName = allHolidayMap.get(dateStr);

                    let badge = '';
                    let badgeStyle: React.CSSProperties = {};
                    if (isLeave) {
                      badge = 'Leave';
                      badgeStyle = { background: '#EDF5ED', color: '#4D7C52' };
                    } else if (isHoliday) {
                      badge = holidayName ?? 'Holiday';
                      badgeStyle = { background: '#EDF5ED', color: '#3A6040' };
                    } else if (isWeekend) {
                      badge = format(day, 'EEEE');
                      badgeStyle = { background: '#F5F0E8', color: '#9CA3AF' };
                    } else {
                      badge = 'Working day';
                      badgeStyle = { background: '#F9FAFB', color: '#9CA3AF' };
                    }

                    return (
                      <div key={dateStr} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">
                          {format(day, 'EEE, MMM d')}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium max-w-32 truncate"
                          style={badgeStyle}
                        >
                          {badge}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {opt.highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-beige-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Highlights</p>
                    {opt.highlights.map(h => (
                      <p key={h} className="text-sm text-gray-600">🎉 {h}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
