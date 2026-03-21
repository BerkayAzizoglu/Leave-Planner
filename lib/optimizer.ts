import { Holiday, LeaveOptimization, OptimizationType } from './types';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';

type DayOffSet = Set<string>;

function buildDaysOffSet(
  year: number,
  holidays: Holiday[],
  companyHolidays: Holiday[],
  blockedDates: string[]
): DayOffSet {
  const set = new Set<string>();

  // Add all weekends
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      set.add(format(cur, 'yyyy-MM-dd'));
    }
    cur.setDate(cur.getDate() + 1);
  }

  // Add public and company holidays
  for (const h of [...holidays, ...companyHolidays]) {
    set.add(h.date);
  }

  return set;
}

function isBlocked(date: string, blockedDates: string[]): boolean {
  return blockedDates.includes(date);
}

function isWorkingDay(date: string, daysOff: DayOffSet): boolean {
  return !daysOff.has(date);
}

function getHolidayName(date: string, holidays: Holiday[], companyHolidays: Holiday[]): string | undefined {
  return [...holidays, ...companyHolidays].find(h => h.date === date)?.name;
}

export function generateOptimizations(
  year: number,
  publicHolidays: Holiday[],
  companyHolidays: Holiday[],
  leaveBalance: number,
  blockedDates: string[],
  maxLeavePerWindow = 5
): LeaveOptimization[] {
  const daysOff = buildDaysOffSet(year, publicHolidays, companyHolidays, blockedDates);
  const allHolidays = [...publicHolidays, ...companyHolidays];
  const results: LeaveOptimization[] = [];

  // Strategy 1: Find bridge opportunities
  // Scan every working day — if surrounded by days off (within N days), it's a bridge candidate
  const allDates: string[] = [];
  const start = new Date(year, 0, 1);
  for (let i = 0; i < 365; i++) {
    allDates.push(format(addDays(start, i), 'yyyy-MM-dd'));
  }

  // Find contiguous blocks of working days between non-working-day clusters
  let i = 0;
  while (i < allDates.length) {
    const date = allDates[i];

    // Skip if it's already a day off or blocked
    if (daysOff.has(date) || isBlocked(date, blockedDates)) {
      i++;
      continue;
    }

    // Find contiguous working day block
    const blockStart = i;
    let blockEnd = i;
    while (
      blockEnd + 1 < allDates.length &&
      isWorkingDay(allDates[blockEnd + 1], daysOff) &&
      !isBlocked(allDates[blockEnd + 1], blockedDates)
    ) {
      blockEnd++;
    }

    const workingBlock = allDates.slice(blockStart, blockEnd + 1);
    const blockLength = workingBlock.length;

    // Check what's before and after this block
    const beforeDate = blockStart > 0 ? allDates[blockStart - 1] : null;
    const afterDate = blockEnd + 1 < allDates.length ? allDates[blockEnd + 1] : null;

    const beforeIsOff = beforeDate ? daysOff.has(beforeDate) : false;
    const afterIsOff = afterDate ? daysOff.has(afterDate) : false;

    // Only interesting if both sides are days off AND block is small enough
    if (beforeIsOff && afterIsOff && blockLength <= maxLeavePerWindow && blockLength > 0) {
      // Calculate total contiguous off period
      // Walk backwards from blockStart to find how far the preceding off-period extends
      let preStart = blockStart - 1;
      while (preStart > 0 && daysOff.has(allDates[preStart - 1])) {
        preStart--;
      }

      // Walk forward from blockEnd to find how far the following off-period extends
      let postEnd = blockEnd + 1;
      while (postEnd + 1 < allDates.length && daysOff.has(allDates[postEnd + 1])) {
        postEnd++;
      }

      const totalStart = allDates[preStart];
      const totalEnd = allDates[postEnd];
      const totalDaysOff = differenceInDays(parseISO(totalEnd), parseISO(totalStart)) + 1;

      if (totalDaysOff < blockLength + 2) {
        i = blockEnd + 1;
        continue; // Not worth it
      }

      const efficiency = totalDaysOff / blockLength;
      if (efficiency < 1.8) {
        i = blockEnd + 1;
        continue;
      }

      // Determine type
      let type: OptimizationType = 'bridge';
      if (blockLength === 1 || blockLength === 2) {
        type = totalDaysOff >= 4 ? 'long-weekend' : 'bridge';
      } else if (blockLength >= 4) {
        type = 'week-stretch';
      } else {
        type = 'cluster';
      }

      // Find relevant holiday names for highlights
      const highlights: string[] = [];
      const nearbyDates = allDates.slice(Math.max(0, preStart), Math.min(allDates.length, postEnd + 1));
      for (const d of nearbyDates) {
        const h = getHolidayName(d, publicHolidays, companyHolidays);
        if (h && !highlights.includes(h)) highlights.push(h);
      }

      const description = buildDescription(type, blockLength, totalDaysOff, highlights);

      results.push({
        id: `opt-${totalStart}`,
        type,
        leaveDaysNeeded: workingBlock,
        totalDaysOff,
        leaveDaysUsed: blockLength,
        efficiency: Math.round(efficiency * 10) / 10,
        startDate: totalStart,
        endDate: totalEnd,
        description,
        highlights,
      });
    }

    i = blockEnd + 1;
  }

  // Sort by efficiency (highest first), deduplicate overlapping windows
  const sorted = results.sort((a, b) => b.efficiency - a.efficiency);
  const deduped = deduplicateOverlapping(sorted);

  // Filter to fit within leave balance
  const filtered = deduped.filter(o => o.leaveDaysUsed <= leaveBalance);

  return filtered.slice(0, 12); // Top 12 opportunities
}

function buildDescription(
  type: OptimizationType,
  leaveDays: number,
  totalDays: number,
  highlights: string[]
): string {
  const leaveWord = leaveDays === 1 ? 'day' : 'days';
  const totalWord = totalDays === 1 ? 'day' : 'days';

  let base = '';
  switch (type) {
    case 'long-weekend':
      base = `Use ${leaveDays} ${leaveWord} of leave for a ${totalDays}-day long weekend`;
      break;
    case 'bridge':
      base = `Bridge ${leaveDays} ${leaveWord} to unlock a ${totalDays}-${totalWord} break`;
      break;
    case 'cluster':
      base = `Take ${leaveDays} ${leaveWord} of leave for ${totalDays} ${totalWord} off`;
      break;
    case 'week-stretch':
      base = `Extend into a ${totalDays}-${totalWord} getaway with just ${leaveDays} ${leaveWord} of leave`;
      break;
  }

  if (highlights.length > 0) {
    base += ` around ${highlights.slice(0, 2).join(' & ')}`;
  }

  return base;
}

function deduplicateOverlapping(opts: LeaveOptimization[]): LeaveOptimization[] {
  const result: LeaveOptimization[] = [];
  const usedDates = new Set<string>();

  for (const opt of opts) {
    // Check if any leave day in this opt overlaps with already-selected opts
    const hasOverlap = opt.leaveDaysNeeded.some(d => usedDates.has(d));
    if (!hasOverlap) {
      result.push(opt);
      opt.leaveDaysNeeded.forEach(d => usedDates.add(d));
    }
  }

  return result;
}

export function calculateRemainingBalance(
  leaveBalance: number,
  usedLeave: number,
  plannedDays: string[]
): number {
  return leaveBalance - usedLeave - plannedDays.length;
}
