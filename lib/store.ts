'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Holiday, LeaveOptimization, CountryCode } from './types';

interface AppState {
  profile: UserProfile;
  publicHolidays: Holiday[];
  selectedYear: number;
  optimizations: LeaveOptimization[];
  selectedOptimizationId: string | null;
  activeTab: string;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPublicHolidays: (holidays: Holiday[]) => void;
  setOptimizations: (opts: LeaveOptimization[]) => void;
  selectOptimization: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  addCompanyHoliday: (holiday: Holiday) => void;
  removeCompanyHoliday: (date: string) => void;
  addBlockedDate: (date: string) => void;
  removeBlockedDate: (date: string) => void;
  addLeaveDay: (date: string) => void;
  removeLeaveDay: (date: string) => void;
  setYear: (year: number) => void;
  completeOnboarding: () => void;
}

const defaultProfile: UserProfile = {
  name: '',
  countryCode: 'GB' as CountryCode,
  leaveBalance: 25,
  usedLeave: 0,
  blockedDates: [],
  familyMode: false,
  budgetPreference: 'mid',
  companyHolidays: [],
  schoolHolidays: [],
  onboardingComplete: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      publicHolidays: [],
      selectedYear: new Date().getFullYear(),
      optimizations: [],
      selectedOptimizationId: null,
      activeTab: 'home',

      updateProfile: (updates) =>
        set(state => ({ profile: { ...state.profile, ...updates } })),

      setPublicHolidays: (holidays) => set({ publicHolidays: holidays }),

      setOptimizations: (optimizations) => set({ optimizations }),

      selectOptimization: (id) => set({ selectedOptimizationId: id }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      addCompanyHoliday: (holiday) =>
        set(state => ({
          profile: {
            ...state.profile,
            companyHolidays: [...state.profile.companyHolidays, holiday],
          },
        })),

      removeCompanyHoliday: (date) =>
        set(state => ({
          profile: {
            ...state.profile,
            companyHolidays: state.profile.companyHolidays.filter(h => h.date !== date),
          },
        })),

      addBlockedDate: (date) =>
        set(state => ({
          profile: {
            ...state.profile,
            blockedDates: [...new Set([...state.profile.blockedDates, date])],
          },
        })),

      removeBlockedDate: (date) =>
        set(state => ({
          profile: {
            ...state.profile,
            blockedDates: state.profile.blockedDates.filter(d => d !== date),
          },
        })),

      addLeaveDay: (date) => {
        const state = get();
        const alreadyUsed = state.profile.usedLeave;
        const balance = state.profile.leaveBalance;
        // Check if we have balance remaining (simplified — not tracking individual days here)
        if (alreadyUsed < balance) {
          set(state => ({
            profile: { ...state.profile, usedLeave: state.profile.usedLeave + 1 },
          }));
        }
      },

      removeLeaveDay: (date) =>
        set(state => ({
          profile: {
            ...state.profile,
            usedLeave: Math.max(0, state.profile.usedLeave - 1),
          },
        })),

      setYear: (year) => set({ selectedYear: year }),

      completeOnboarding: () =>
        set(state => ({
          profile: { ...state.profile, onboardingComplete: true },
        })),
    }),
    {
      name: 'leave-planner-store',
      partialize: (state) => ({
        profile: state.profile,
        selectedYear: state.selectedYear,
      }),
    }
  )
);
