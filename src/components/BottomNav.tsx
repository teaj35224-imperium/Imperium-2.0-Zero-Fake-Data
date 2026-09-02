import React from 'react';
import { LayoutDashboard, DollarSign, Activity, FileText, Zap, Shield, Users } from 'lucide-react';
import { useImperium } from '../context/ImperiumContext';

export const BottomNav: React.FC = () => {
  const { activeModal, setActiveModal, opportunities } = useImperium();
  const pendingCount = opportunities.filter(o => o.status === 'PENDING_NEXUS').length;

  const navItems = [
    {
      id: 'cockpit',
      label: 'COCKPIT',
      icon: LayoutDashboard,
      isActive: activeModal === null,
      onClick: () => setActiveModal(null)
    },
    {
      id: 'money',
      label: 'MONEY',
      icon: DollarSign,
      isActive: (activeModal as any) === 'MONEY',
      onClick: () => setActiveModal('MONEY' as any)
    },
    {
      id: 'live-ops',
      label: 'LIVE OPS',
      icon: Activity,
      isActive: (activeModal as any) === 'LIVE_OPERATIONS',
      onClick: () => setActiveModal('LIVE_OPERATIONS' as any)
    },
    {
      id: 'got-one',
      label: 'GOT ONE',
      icon: Zap,
      badge: pendingCount > 0 ? pendingCount : null,
      isActive: activeModal === 'GOT_ONE_DETAIL',
      onClick: () => setActiveModal('GOT_ONE_DETAIL')
    },
    {
      id: 'brief',
      label: 'BRIEF',
      icon: FileText,
      isActive: (activeModal as any) === 'DAILY_BRIEF',
      onClick: () => setActiveModal('DAILY_BRIEF' as any)
    },
    {
      id: 'workers',
      label: 'WORKERS',
      icon: Users,
      isActive: activeModal === 'WORKERS',
      onClick: () => setActiveModal('WORKERS')
    },
    {
      id: 'risk',
      label: 'RISK',
      icon: Shield,
      isActive: activeModal === 'RISK',
      onClick: () => setActiveModal('RISK')
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0D0D0E]/95 border-t border-[#1F1F21] backdrop-blur-lg pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center p-1 rounded-md transition-all active:scale-95 touch-manipulation min-w-[44px] ${
                item.isActive 
                  ? 'text-[#C5A059] bg-[#C5A059]/10' 
                  : 'text-[#7A7A7A] hover:text-[#D1D1D1]'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#C5A059] text-[#0D0D0E] text-[8px] font-bold font-mono flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-mono tracking-wider mt-0.5 uppercase font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

