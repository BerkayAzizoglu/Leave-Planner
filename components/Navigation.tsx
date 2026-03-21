'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Sparkles, Compass, Settings } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/suggestions', label: 'Plans', icon: Sparkles },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-beige-200 safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200"
              style={{
                color: active ? '#4D7C52' : '#9CA3AF',
              }}
            >
              <div
                className="p-1.5 rounded-xl transition-all duration-200"
                style={{ background: active ? '#EDF5ED' : 'transparent' }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
