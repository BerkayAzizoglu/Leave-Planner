'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, CalendarDays, Wallet, Users } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { COUNTRIES } from '@/lib/countries';
import { CountryCode, BudgetLevel } from '@/lib/types';

const steps = ['country', 'balance', 'budget', 'family'] as const;
type Step = typeof steps[number];

export default function OnboardingModal() {
  const { updateProfile, completeOnboarding } = useAppStore();
  const [step, setStep] = useState<Step>('country');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<CountryCode>('GB');
  const [balance, setBalance] = useState(25);
  const [budget, setBudget] = useState<BudgetLevel>('mid');
  const [family, setFamily] = useState(false);

  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function next() {
    if (step === 'family') {
      updateProfile({ name, countryCode: country, leaveBalance: balance, budgetPreference: budget, familyMode: family });
      completeOnboarding();
    } else {
      setStep(steps[stepIndex + 1]);
    }
  }

  const canProceed =
    step === 'country' ? !!country :
    step === 'balance' ? balance > 0 :
    true;

  return (
    <div className="fixed inset-0 bg-beige-50 z-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-beige-200">
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#4D7C52' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'country' && (
            <StepCountry
              key="country"
              name={name}
              setName={setName}
              country={country}
              setCountry={setCountry}
            />
          )}
          {step === 'balance' && (
            <StepBalance key="balance" balance={balance} setBalance={setBalance} />
          )}
          {step === 'budget' && (
            <StepBudget key="budget" budget={budget} setBudget={setBudget} />
          )}
          {step === 'family' && (
            <StepFamily key="family" family={family} setFamily={setFamily} />
          )}
        </AnimatePresence>

        <div className="mt-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={next}
            disabled={!canProceed}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: '#4D7C52' }}
          >
            {step === 'family' ? 'Get Started' : 'Continue'}
            <ChevronRight size={18} />
          </motion.button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Step {stepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}

const slideIn = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25 },
};

function StepCountry({
  name, setName, country, setCountry,
}: {
  name: string;
  setName: (v: string) => void;
  country: CountryCode;
  setCountry: (v: CountryCode) => void;
}) {
  return (
    <motion.div {...slideIn} className="flex-1">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#EDF5ED' }}>
        <MapPin size={22} style={{ color: '#4D7C52' }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Where are you based?</h2>
      <p className="text-gray-500 mb-8">We&apos;ll load public holidays for your country automatically.</p>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600 mb-2 block">Your name (optional)</label>
        <input
          type="text"
          placeholder="e.g. Alex"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white border border-beige-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-sage-300 transition-colors"
        />
      </div>

      <label className="text-sm font-medium text-gray-600 mb-2 block">Country</label>
      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {COUNTRIES.map(c => (
          <button
            key={c.code}
            onClick={() => setCountry(c.code)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
            style={{
              background: country === c.code ? '#EDF5ED' : 'white',
              border: country === c.code ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
              color: country === c.code ? '#3A6040' : '#374151',
              fontWeight: country === c.code ? 600 : 400,
            }}
          >
            <span className="text-lg">{c.flag}</span>
            <span className="truncate">{c.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function StepBalance({ balance, setBalance }: { balance: number; setBalance: (v: number) => void }) {
  const presets = [10, 15, 20, 25, 28, 30];
  return (
    <motion.div {...slideIn} className="flex-1">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#EBF4FA' }}>
        <CalendarDays size={22} style={{ color: '#3D85AE' }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Annual leave balance</h2>
      <p className="text-gray-500 mb-8">How many days of annual leave do you get per year?</p>

      <div className="text-center mb-8">
        <div className="text-7xl font-bold mb-1" style={{ color: '#4D7C52' }}>{balance}</div>
        <p className="text-gray-400">days per year</p>
      </div>

      <input
        type="range"
        min={1}
        max={45}
        value={balance}
        onChange={e => setBalance(Number(e.target.value))}
        className="w-full mb-6"
        style={{ accentColor: '#4D7C52' }}
      />

      <div className="grid grid-cols-3 gap-2">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => setBalance(p)}
            className="py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: balance === p ? '#EDF5ED' : 'white',
              border: balance === p ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
              color: balance === p ? '#3A6040' : '#6B7280',
            }}
          >
            {p} days
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function StepBudget({ budget, setBudget }: { budget: BudgetLevel; setBudget: (v: BudgetLevel) => void }) {
  const options: { value: BudgetLevel; label: string; desc: string; emoji: string }[] = [
    { value: 'low', label: 'Budget-conscious', desc: 'Affordable destinations & stays', emoji: '🌿' },
    { value: 'mid', label: 'Balanced', desc: 'Comfort without splurging', emoji: '✈️' },
    { value: 'high', label: 'Premium', desc: 'Luxury travel & experiences', emoji: '🏆' },
  ];

  return (
    <motion.div {...slideIn} className="flex-1">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#FEF3C7' }}>
        <Wallet size={22} style={{ color: '#D97706' }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Travel budget preference</h2>
      <p className="text-gray-500 mb-8">We&apos;ll tailor destination suggestions to your budget.</p>

      <div className="space-y-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setBudget(opt.value)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{
              background: budget === opt.value ? '#EDF5ED' : 'white',
              border: budget === opt.value ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
            }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <p className="font-semibold text-gray-800">{opt.label}</p>
              <p className="text-sm text-gray-400">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function StepFamily({ family, setFamily }: { family: boolean; setFamily: (v: boolean) => void }) {
  return (
    <motion.div {...slideIn} className="flex-1">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#FAE8E3' }}>
        <Users size={22} style={{ color: '#D96B5B' }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Family mode</h2>
      <p className="text-gray-500 mb-8">Do you have school-age children? We&apos;ll factor in school holidays and suggest family-friendly destinations.</p>

      <div className="space-y-3">
        {[
          { value: true, label: 'Yes, family mode', desc: 'Align with school schedules', emoji: '👨‍👩‍👧' },
          { value: false, label: 'No, just me', desc: 'Full flexibility throughout the year', emoji: '🧳' },
        ].map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => setFamily(opt.value)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{
              background: family === opt.value ? '#EDF5ED' : 'white',
              border: family === opt.value ? '1.5px solid #6B9E6B' : '1.5px solid #F5F0E8',
            }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <p className="font-semibold text-gray-800">{opt.label}</p>
              <p className="text-sm text-gray-400">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
