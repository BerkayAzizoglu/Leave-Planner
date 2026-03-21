'use client';

import { Holiday, CountryCode } from './types';
import { format, parseISO } from 'date-fns';

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

const cache: Map<string, Holiday[]> = new Map();

export async function fetchPublicHolidays(
  countryCode: CountryCode,
  year: number
): Promise<Holiday[]> {
  const key = `${countryCode}-${year}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error('Failed to fetch');

    const data: NagerHoliday[] = await res.json();
    const holidays: Holiday[] = data
      .filter(h => h.global) // only country-wide holidays
      .map(h => ({
        date: h.date,
        name: h.name,
        localName: h.localName,
        type: 'public' as const,
      }));

    cache.set(key, holidays);
    return holidays;
  } catch {
    // Fallback with common holidays if API fails
    return getFallbackHolidays(countryCode, year);
  }
}

function getFallbackHolidays(countryCode: CountryCode, year: number): Holiday[] {
  const common: Holiday[] = [
    { date: `${year}-01-01`, name: "New Year's Day", type: 'public' },
  ];

  const byCountry: Record<string, Holiday[]> = {
    US: [
      { date: `${year}-07-04`, name: 'Independence Day', type: 'public' },
      { date: `${year}-11-11`, name: 'Veterans Day', type: 'public' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
    ],
    GB: [
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
      { date: `${year}-12-26`, name: 'Boxing Day', type: 'public' },
    ],
    DE: [
      { date: `${year}-10-03`, name: 'German Unity Day', type: 'public' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
      { date: `${year}-12-26`, name: 'Second Day of Christmas', type: 'public' },
    ],
    TR: [
      { date: `${year}-04-23`, name: 'National Sovereignty Day', type: 'public' },
      { date: `${year}-05-19`, name: 'Commemoration of Atatürk', type: 'public' },
      { date: `${year}-10-29`, name: 'Republic Day', type: 'public' },
    ],
    FR: [
      { date: `${year}-07-14`, name: 'Bastille Day', type: 'public' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'public' },
    ],
  };

  return [...common, ...(byCountry[countryCode] ?? [])];
}

export function isWeekend(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(dateStr: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find(h => h.date === dateStr);
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(format(current, 'yyyy-MM-dd'));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
