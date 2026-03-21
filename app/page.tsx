'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, TrendingUp, Sun, ChevronRight, Leaf } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { fetchPublicHolidays, formatDate } from '@/lib/holidays';
import { generateOptimizations } from '@/lib/optimizer';
import { LeaveOptimization } from '@/lib/types';
import { getCountry } from '@/lib/countries';
import OnboardingModal from '@/components/OnboardingModal';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  const {
    profile,
    publicHolidays,
    optimizations,
    selectedYear,
    setPublicHolidays,
    setOptimizations,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const remaining = profile.leaveBalance - profile.usedLeave;
  const country = getCountry(profile.countryCode);

  useEffect(() => {
    async function load() {
      if (!profile.onboardingComplete) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const holidays = await fetchPublicHolidays(profile.countryCode, selectedYear);
      setPublicHolidays(holidays);
      const opts = generateOptimizations(
        selectedYear,
        holidays,
        profile.companyHolidays,
        profile.leaveBalance,
        profile.blockedDates
      );
      setOptimizations(opts);
      setLoading(false);
    }
    load();
  }, [profile.countryCode, profile.leaveBalance, profile.companyHolidays, profile.blockedDates, selectedYear]);

  if (!profile.onboardingComplete) {
    return <OnboardingModal />;
  }

  const topOpt = optimizations[0];
  const today = new Date().toISOString().split('T')[0];
  const nextHoliday = publicHolidays
    .filter(h => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: '#6B9E6B' }}>
              {country?.flag} {country?.name} · {selectedYear}
            </p>
            <h1 className="text-2xl font-bold text-gray-800">
              {profile.name ? `Hey, ${profile.name.split(' ')[0]} 👋` : 'Smart Leave Planner'}
            </h1>
          </div>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: '#EDF5ED' }}>
            <Leaf size={20} style={{ color: '#4D7C52' }} />
          </div>
        </div>
      </motion.div>

      {/* Leave Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl p-5 mb-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4D7C52 0%, #6B9E6B 100%)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-10 -translate-x-6" />
        <p className="text-sm font-medium mb-1" style={{ color: '#B3CEB3' }}>Leave Balance</p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-5xl font-bold text-white">{remaining}</span>
          <span className="text-lg mb-1" style={{ color: '#B3CEB3' }}>/ {profile.leaveBalance} days</span>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs" style={{ color: '#B3CEB3' }}>Used</p>
            <p className="text-white font-semibold">{profile.usedLeave} days</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#B3CEB3' }}>Opportunities</p>
            <p className="text-white font-semibold">{optimizations.length} found</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: '#B3CEB3' }}>Next Holiday</p>
            <p className="text-white font-semibold">
              {nextHoliday ? formatDate(nextHoliday.date, 'MMM d') : '–'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Opportunity */}
      {topOpt && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-4"
        >
          <SectionHeader title="Best Opportunity" href="/suggestions" />
          <OptimizationCard opt={topOpt} featured />
        </motion.div>
      )}

      {/* Stats row */}
      {!loading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <motion.div variants={item}>
            <StatCard
              icon={<TrendingUp size={18} style={{ color: '#5FA0C5' }} />}
              bgColor="#EBF4FA"
              label="Best efficiency"
              value={optimizations.length > 0 ? `${optimizations[0]?.efficiency}×` : '–'}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              icon={<Sun size={18} style={{ color: '#D97706' }} />}
              bgColor="#FEF3C7"
              label="Potential days off"
              value={optimizations.reduce((s, o) => s + o.totalDaysOff, 0).toString()}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Upcoming holidays */}
      {publicHolidays.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <SectionHeader title="Upcoming Holidays" href="/calendar" />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {publicHolidays
              .filter(h => h.date >= today)
              .slice(0, 4)
              .map((h, i, arr) => (
                <div
                  key={h.date}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #F5F0E8' : 'none' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDF5ED' }}>
                    <CalendarDays size={16} style={{ color: '#6B9E6B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(h.date, 'EEEE, MMM d')}</p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* More suggestions preview */}
      {optimizations.length > 1 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SectionHeader title="More Opportunities" href="/suggestions" />
          <div className="space-y-3">
            {optimizations.slice(1, 4).map(opt => (
              <OptimizationCard key={opt.id} opt={opt} />
            ))}
          </div>
        </motion.div>
      )}

      {loading && profile.onboardingComplete && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#B3CEB3', borderTopColor: '#4D7C52' }} />
          <p className="text-sm text-gray-400">Finding your best opportunities…</p>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <Link href={href} className="flex items-center gap-0.5 text-sm font-medium" style={{ color: '#4D7C52' }}>
        See all <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function StatCard({
  icon, bgColor, label, value,
}: {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: bgColor }}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function OptimizationCard({ opt, featured }: { opt: LeaveOptimization; featured?: boolean }) {
  const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
    'long-weekend': { label: 'Long Weekend', bg: '#EBF4FA', text: '#3D85AE' },
    bridge: { label: 'Bridge Days', bg: '#EDF5ED', text: '#4D7C52' },
    cluster: { label: 'Cluster', bg: '#FEF3C7', text: '#D97706' },
    'week-stretch': { label: 'Week Stretch', bg: '#FAE8E3', text: '#D96B5B' },
  };
  const cfg = typeConfig[opt.type] ?? { label: opt.type, bg: '#F5F0E8', text: '#6B7280' };

  return (
    <Link href="/suggestions">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
        style={{ border: featured ? '1px solid #B3CEB3' : '1px solid transparent' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
                {cfg.label}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(opt.startDate, 'MMM d')} – {formatDate(opt.endDate, 'MMM d')}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-snug">{opt.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold" style={{ color: '#4D7C52' }}>{opt.efficiency}×</p>
            <p className="text-xs text-gray-400">{opt.leaveDaysUsed}d leave</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <div className="h-1.5 rounded-full flex-1 bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min((opt.totalDaysOff / 14) * 100, 100)}%`, background: '#6B9E6B' }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{opt.totalDaysOff} days off</span>
        </div>
      </motion.div>
    </Link>
  );
}
