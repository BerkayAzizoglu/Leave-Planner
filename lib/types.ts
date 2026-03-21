export type CountryCode =
  | 'US' | 'GB' | 'DE' | 'FR' | 'IT' | 'ES' | 'TR' | 'CN'
  | 'NL' | 'SE' | 'NO' | 'DK' | 'PL' | 'AT' | 'BE' | 'PT';

export interface CountryOption {
  code: CountryCode;
  name: string;
  flag: string;
  region: 'europe' | 'americas' | 'asia' | 'turkey';
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'public' | 'company' | 'school';
  localName?: string;
}

export interface LeaveDay {
  date: string;
  note?: string;
}

export type OptimizationType = 'bridge' | 'long-weekend' | 'cluster' | 'week-stretch';

export interface LeaveOptimization {
  id: string;
  type: OptimizationType;
  leaveDaysNeeded: string[]; // dates to use leave
  totalDaysOff: number;
  leaveDaysUsed: number;
  efficiency: number; // totalDaysOff / leaveDaysUsed
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[]; // e.g. ["Good Friday", "Easter Monday"]
}

export type BudgetLevel = 'low' | 'mid' | 'high';
export type TravelCategory = 'weekend' | 'nature' | 'international' | 'city';

export interface TravelDestination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  duration: string;
  budgetLevel: BudgetLevel;
  category: TravelCategory;
  emoji: string;
  bestFor: string[];
  regions: string[]; // which user regions see this suggestion
}

export interface LocalActivity {
  id: string;
  name: string;
  category: 'outdoor' | 'culture' | 'food' | 'wellness' | 'social';
  duration: string;
  emoji: string;
  bestTime: 'after-work' | 'evening' | 'weekend';
}

export interface UserProfile {
  name: string;
  countryCode: CountryCode;
  leaveBalance: number;
  usedLeave: number;
  blockedDates: string[];
  familyMode: boolean;
  budgetPreference: BudgetLevel;
  companyHolidays: Holiday[];
  schoolHolidays: Holiday[];
  onboardingComplete: boolean;
}

export type DayType =
  | 'working'
  | 'weekend'
  | 'public-holiday'
  | 'company-holiday'
  | 'school-holiday'
  | 'leave'
  | 'suggested-leave'
  | 'blocked';
