//web/src/components/dashboard-sidebar.tsx

// Displays the Taskora dashboard sidebar and navigation menu.
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Clock3,
  CheckCircle2,
  Settings,
  CheckSquare,
} from 'lucide-react';

// Defines the navigation links displayed in the sidebar.
const navigationItems = [
  {
    label: 'Overview',
    href: '/',
    icon: LayoutDashboard,
    key: 'overview',
  },
  {
    label: 'To Do',
    href: '/?status=TODO',
    icon: Clock3,
    key: 'TODO',
  },
  {
    label: 'In Progress',
    href: '/?status=IN_PROGRESS',
    icon: Clock3,
    key: 'IN_PROGRESS',
  },
  {
    label: 'Completed',
    href: '/?status=DONE',
    icon: CheckCircle2,
    key: 'DONE',
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#111827] px-5 py-7 text-white">
      
      {/* Displays the Taskora brand identity. */}
      <div className="mb-12 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <CheckSquare size={22} strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Taskora
          </h2>
          <p className="text-xs text-slate-400">
            Plan smarter. Get things done.
          </p>
        </div>
      </div>

      {/* Displays the primary navigation links. */}
      <nav className="flex-1 space-y-2">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          // Determine active state strictly based on route and status parameter
          let isActive = false;
          if (item.key === 'overview') {
            isActive = (pathname === '/' || pathname === '/tasks') && !currentStatus;
          } else {
            isActive = (pathname === '/' || pathname === '/tasks') && currentStatus === item.key;
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Displays the sidebar settings navigation. */}
      <div className="border-t border-slate-700 pt-5">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Settings size={19} />
          <span>Settings</span>
        </Link>

        {/* Displays the Taskora sidebar footer. */}
        <div className="mt-6 rounded-xl bg-slate-800/70 p-4">
          <p className="text-sm font-semibold text-white">
            Taskora
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your workspace, simplified.
          </p>
        </div>
      </div>
    </aside>
  );
}