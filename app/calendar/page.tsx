'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth,
  parseISO, getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { fetchPublicHolidays } from '@/lib/holidays';
import { Holiday, DayType } from '@/lib/types';

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function CalendarPage() {
  const { profile, publicHolidays, optimizations, selectedYear, setPublicHolidays } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedYear, new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicHolidays(profile.countryCode, currentMonth.getFullYear()).then(setPublicHolidays);
  }, [profile.countryCode, currentMonth]);

  const allHolidays: Holiday[] = useMemo(() => [
    ...publicHolidays,
    ...profile.companyHolidays,
    ...profile.schoolHolidays,
  ], [publicHolidays, profile.companyHolidays, profile.schoolHolidays]);

  const suggestedLeaveDates = useMemo(
    () => new Set(optimizations.flatMap(o => o.leaveDaysNeeded)),
    [optimizations]
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get grid start (Monday-based week)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function getDayType(date: Date): DayType {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (profile.blockedDates.includes(dateStr)) return 'blocked';
    const holiday = allHolidays.find(h => h.date === dateStr);
    if (holiday) {
      if (holiday.type === 'school') return 'school-holiday';
      if (holiday.type === 'company') return 'company-holiday';
      return 'public-holiday';
    }
    if (isWeekend) return 'weekend';
    if (suggestedLeaveDates.has(dateStr)) return 'suggested-leave';
    return 'working';
  }

  function getDayStyle(type: DayType, isCurrentMonth: boolean): React.CSSProperties {
    const opacity = isCurrentMonth ? 1 : 0.3;
    const styles: Record<DayType, React.CSSProperties> = {
      working: { color: '#374151' },
      weekend: { color: '#9CA3AF' },
      'public-holiday': { background: '#EDF5ED', color: '#3A6040', fontWeight: 600 },
      'company-holiday': { background: '#EBF4FA', color: '#3D85AE', fontWeight: 600 },
      'school-holiday': { background: '#FEF3C7', color: '#D97706', fontWeight: 600 },
      'suggested-leave': { background: '#F5F0E8', color: '#4D7C52', fontWeight: 600, border: '1.5px dashed #6B9E6B' },
      leave: { background: '#4D7C52', color: 'white', fontWeight: 700 },
      blocked: { background: '#FAE8E3', color: '#D96B5B' },
    };
    return { ...styles[type], opacity };
  }

  const selectedDateInfo = useMemo(() => {
    if (!selectedDate) return null;
    const holiday = allHolidays.find(h => h.date === selectedDate);
    const isSuggested = suggestedLeaveDates.has(selectedDate);
    const isBlocked = profile.blockedDates.includes(selectedDate);
    return { holiday, isSuggested, isBlocked };
  }, [selectedDate, allHolidays, suggestedLeaveDates, profile.blockedDates]);

  return (
    <div className="px-4 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-24 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'Public holiday', bg: '#EDF5ED', color: '#3A6040' },
          { label: 'Company holiday', bg: '#EBF4FA', color: '#3D85AE' },
          { label: 'Suggested leave', bg: '#F5F0E8', color: '#4D7C52', dashed: true },
          { label: 'Blocked', bg: '#FAE8E3', color: '#D96B5B' },
        ].map(({ label, bg, color, dashed }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: bg, color, border: dashed ? `1.5px dashed ${color}` : 'none' }}
          >
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {gridDays.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const type = getDayType(date);
            const style = getDayStyle(type, isCurrentMonth);
            const isSelected = selectedDate === dateStr;

            return (
              <motion.button
                key={dateStr}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="aspect-square rounded-xl flex items-center justify-center text-sm transition-all relative"
                style={{
                  ...style,
                  boxShadow: isSelected ? '0 0 0 2px #4D7C52' : 'none',
                }}
              >
                {format(date, 'd')}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected date info */}
      {selectedDate && selectedDateInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        >
          <p className="font-semibold text-gray-800 mb-1">
            {format(parseISO(selectedDate), 'EEEE, MMMM d yyyy')}
          </p>
          {selectedDateInfo.holiday && (
            <p className="text-sm text-sage-500">🎉 {selectedDateInfo.holiday.name}</p>
          )}
          {selectedDateInfo.isSuggested && (
            <p className="text-sm" style={{ color: '#4D7C52' }}>✨ Suggested leave day</p>
          )}
          {selectedDateInfo.isBlocked && (
            <p className="text-sm" style={{ color: '#D96B5B' }}>🚫 Blocked date</p>
          )}
          {!selectedDateInfo.holiday && !selectedDateInfo.isSuggested && !selectedDateInfo.isBlocked && (
            <p className="text-sm text-gray-400">Regular working day</p>
          )}
        </motion.div>
      )}

      {/* Monthly holiday list */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Holidays this month</h2>
        {allHolidays
          .filter(h => h.date.startsWith(format(currentMonth, 'yyyy-MM')))
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(h => (
            <div
              key={h.date}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: h.type === 'public' ? '#4D7C52' : h.type === 'company' ? '#3D85AE' : '#D97706',
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{h.name}</p>
                <p className="text-xs text-gray-400">{format(parseISO(h.date), 'EEEE, d MMM')}</p>
              </div>
            </div>
          ))}
        {allHolidays.filter(h => h.date.startsWith(format(currentMonth, 'yyyy-MM'))).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No holidays this month</p>
        )}
      </div>
    </div>
  );
}
