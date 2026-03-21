'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, CalendarDays, Wallet, Users, Plus, Trash2,
  ChevronRight, Info, RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { COUNTRIES } from '@/lib/countries';
import { CountryCode, BudgetLevel, Holiday } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export default function SettingsPage() {
  const { profile, updateProfile } = useAppStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">Personalize your leave planner</p>
      </div>

      <div className="space-y-3">
        {/* Profile section */}
        <SettingsSection
          id="profile"
          icon={<User size={18} style={{ color: '#4D7C52' }} />}
          iconBg="#EDF5ED"
          title="Profile"
          subtitle={profile.name || 'Set your name'}
          active={activeSection === 'profile'}
          onToggle={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}
        >
          <ProfileSection />
        </SettingsSection>

        {/* Country */}
        <SettingsSection
          id="country"
          icon={<MapPin size={18} style={{ color: '#3D85AE' }} />}
          iconBg="#EBF4FA"
          title="Country"
          subtitle={COUNTRIES.find(c => c.code === profile.countryCode)?.name ?? profile.countryCode}
          active={activeSection === 'country'}
          onToggle={() => setActiveSection(activeSection === 'country' ? null : 'country')}
        >
          <CountrySection />
        </SettingsSection>

        {/* Leave balance */}
        <SettingsSection
          id="balance"
          icon={<CalendarDays size={18} style={{ color: '#D97706' }} />}
          iconBg="#FEF3C7"
          title="Leave Balance"
          subtitle={`${profile.leaveBalance} days total · ${profile.usedLeave} used`}
          active={activeSection === 'balance'}
          onToggle={() => setActiveSection(activeSection === 'balance' ? null : 'balance')}
        >
          <LeaveBalanceSection />
        </SettingsSection>

        {/* Company holidays */}
        <SettingsSection
          id="company"
          icon={<CalendarDays size={18} style={{ color: '#D96B5B' }} />}
          iconBg="#FAE8E3"
          title="Company Holidays"
          subtitle={`${profile.companyHolidays.length} holidays added`}
          active={activeSection === 'company'}
          onToggle={() => setActiveSection(activeSection === 'company' ? null : 'company')}
        >
          <CompanyHolidaysSection />
        </SettingsSection>

        {/* Blocked dates */}
        <SettingsSection
          id="blocked"
          icon={<CalendarDays size={18} style={{ color: '#9CA3AF' }} />}
          iconBg="#F5F0E8"
          title="Blocked Dates"
          subtitle={`${profile.blockedDates.length} dates blocked`}
          active={activeSection === 'blocked'}
          onToggle={() => setActiveSection(activeSection === 'blocked' ? null : 'blocked')}
        >
          <BlockedDatesSection />
        </SettingsSection>

        {/* Budget */}
        <SettingsSection
          id="budget"
          icon={<Wallet size={18} style={{ color: '#4D7C52' }} />}
          iconBg="#EDF5ED"
          title="Travel Budget"
          subtitle={{ low: 'Budget-conscious', mid: 'Balanced', high: 'Premium' }[profile.budgetPreference]}
          active={activeSection === 'budget'}
          onToggle={() => setActiveSection(activeSection === 'budget' ? null : 'budget')}
        >
          <BudgetSection />
        </SettingsSection>

        {/* Family mode */}
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FAE8E3' }}>
              <Users size={16} style={{ color: '#D96B5B' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Family Mode</p>
              <p className="text-xs text-gray-400">Align with school holidays</p>
            </div>
          </div>
          <button
            onClick={() => updateProfile({ familyMode: !profile.familyMode })}
            className="w-12 h-6 rounded-full transition-all relative"
            style={{ background: profile.familyMode ? '#4D7C52' : '#E5E7EB' }}
          >
            <div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
              style={{ left: profile.familyMode ? '26px' : '2px' }}
            />
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm('Reset all settings to defaults?')) {
              updateProfile({
                leaveBalance: 25,
                usedLeave: 0,
                blockedDates: [],
                companyHolidays: [],
                schoolHolidays: [],
                onboardingComplete: false,
              });
            }
          }}
          className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm text-red-400"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-medium">Reset to defaults</span>
        </button>
      </div>

      {/* App info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">Smart Leave Planner · v1.0</p>
        <p className="text-xs text-gray-300 mt-1 flex items-center justify-center gap-1">
          <Info size={11} /> Holiday data from Nager.Date API
        </p>
      </div>
    </div>
  );
}

function SettingsSection({
  id, icon, iconBg, title, subtitle, active, onToggle, children,
}: {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={onToggle}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 truncate">{subtitle}</p>
        </div>
        <ChevronRight
          size={16}
          className="text-gray-400 transition-transform"
          style={{ transform: active ? 'rotate(90deg)' : 'none' }}
        />
      </button>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-beige-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileSection() {
  const { profile, updateProfile } = useAppStore();
  const [name, setName] = useState(profile.name);
  return (
    <div className="pt-3">
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Your name</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={() => updateProfile({ name })}
        placeholder="e.g. Alex"
        className="w-full px-3 py-2.5 rounded-xl border border-beige-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sage-300"
      />
    </div>
  );
}

function CountrySection() {
  const { profile, updateProfile } = useAppStore();
  return (
    <div className="pt-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
      {COUNTRIES.map(c => (
        <button
          key={c.code}
          onClick={() => updateProfile({ countryCode: c.code })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all"
          style={{
            background: profile.countryCode === c.code ? '#EDF5ED' : '#FAFAF7',
            border: profile.countryCode === c.code ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
            color: profile.countryCode === c.code ? '#3A6040' : '#374151',
            fontWeight: profile.countryCode === c.code ? 600 : 400,
          }}
        >
          <span>{c.flag}</span>
          <span className="truncate">{c.name}</span>
        </button>
      ))}
    </div>
  );
}

function LeaveBalanceSection() {
  const { profile, updateProfile } = useAppStore();
  return (
    <div className="pt-3 space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Annual leave balance</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={45}
            value={profile.leaveBalance}
            onChange={e => updateProfile({ leaveBalance: Number(e.target.value) })}
            className="flex-1"
            style={{ accentColor: '#4D7C52' }}
          />
          <span className="text-lg font-bold w-12 text-right" style={{ color: '#4D7C52' }}>
            {profile.leaveBalance}
          </span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Days already used</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={profile.leaveBalance}
            value={profile.usedLeave}
            onChange={e => updateProfile({ usedLeave: Number(e.target.value) })}
            className="flex-1"
            style={{ accentColor: '#3D85AE' }}
          />
          <span className="text-lg font-bold w-12 text-right" style={{ color: '#3D85AE' }}>
            {profile.usedLeave}
          </span>
        </div>
      </div>
      <div className="bg-beige-50 rounded-xl p-3">
        <p className="text-sm text-gray-600">
          Remaining: <span className="font-bold" style={{ color: '#4D7C52' }}>{profile.leaveBalance - profile.usedLeave} days</span>
        </p>
      </div>
    </div>
  );
}

function CompanyHolidaysSection() {
  const { profile, addCompanyHoliday, removeCompanyHoliday } = useAppStore();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  function add() {
    if (!date || !name.trim()) return;
    addCompanyHoliday({ date, name: name.trim(), type: 'company' });
    setDate('');
    setName('');
  }

  return (
    <div className="pt-3 space-y-3">
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-beige-200 text-sm text-gray-700 focus:outline-none focus:border-sage-300"
        />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Holiday name"
          className="flex-1 px-3 py-2 rounded-xl border border-beige-200 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-sage-300"
        />
        <button
          onClick={add}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#EDF5ED', color: '#4D7C52' }}
        >
          <Plus size={18} />
        </button>
      </div>
      {profile.companyHolidays.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">No company holidays added yet</p>
      )}
      {profile.companyHolidays.map(h => (
        <div key={h.date} className="flex items-center gap-3 bg-beige-50 rounded-xl px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
            <p className="text-xs text-gray-400">{format(parseISO(h.date), 'EEEE, MMM d yyyy')}</p>
          </div>
          <button onClick={() => removeCompanyHoliday(h.date)}>
            <Trash2 size={15} className="text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}

function BlockedDatesSection() {
  const { profile, addBlockedDate, removeBlockedDate } = useAppStore();
  const [date, setDate] = useState('');

  function add() {
    if (!date) return;
    addBlockedDate(date);
    setDate('');
  }

  return (
    <div className="pt-3 space-y-3">
      <p className="text-xs text-gray-400">Block dates when you&apos;re unavailable (e.g. deadlines, busy periods). The optimizer will skip these.</p>
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-beige-200 text-sm text-gray-700 focus:outline-none focus:border-sage-300"
        />
        <button
          onClick={add}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#FAE8E3', color: '#D96B5B' }}
        >
          <Plus size={18} />
        </button>
      </div>
      {profile.blockedDates.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">No blocked dates</p>
      )}
      <div className="flex flex-wrap gap-2">
        {profile.blockedDates.sort().map(d => (
          <div
            key={d}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{ background: '#FAE8E3', color: '#D96B5B' }}
          >
            {format(parseISO(d), 'MMM d')}
            <button onClick={() => removeBlockedDate(d)}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetSection() {
  const { profile, updateProfile } = useAppStore();
  const options: { value: BudgetLevel; label: string; desc: string; emoji: string }[] = [
    { value: 'low', label: 'Budget-conscious', desc: 'Affordable destinations', emoji: '🌿' },
    { value: 'mid', label: 'Balanced', desc: 'Comfort without splurging', emoji: '✈️' },
    { value: 'high', label: 'Premium', desc: 'Luxury travel', emoji: '🏆' },
  ];
  return (
    <div className="pt-3 space-y-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => updateProfile({ budgetPreference: opt.value })}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
          style={{
            background: profile.budgetPreference === opt.value ? '#EDF5ED' : '#FAFAF7',
            border: profile.budgetPreference === opt.value ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
          }}
        >
          <span className="text-xl">{opt.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
            <p className="text-xs text-gray-400">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
