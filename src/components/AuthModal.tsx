import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, UserCheck, AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';
import { UserRole, AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER/ADMIN');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          setCurrentUser(json.user);
          setSelectedRole(json.user.role);
        }
      }
    } catch (e) {
      console.warn('Auth fetch error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const handleRoleSwitch = async (newRole: UserRole) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.user);
        setSelectedRole(newRole);
        setNotification(`Role updated to ${newRole}. Backend permissions enforced.`);
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  const roleDefinitions: Record<UserRole, { title: string; description: string; permissions: string[]; restrictions: string[] }> = {
    'OWNER/ADMIN': {
      title: 'Owner & Chief Administrator',
      description: 'Complete operational and supervisory control of the entire Imperium instance.',
      permissions: [
        'Authorize paper trades',
        'Modify risk limits & trade caps',
        'Trigger Emergency Exit All',
        'Configure workers and AI engine parameters'
      ],
      restrictions: [
        'API keys and server secrets remain strictly hidden server-side'
      ]
    },
    'DEVELOPER': {
      title: 'Systems & Worker Developer',
      description: 'Technical engineering access for worker health, algorithms, and system logs.',
      permissions: [
        'Audit system logs and telemetry',
        'Trigger worker self-repair & quarantine',
        'Test prompt reasoning and model outputs'
      ],
      restrictions: [
        'Cannot modify global risk limits without Admin override'
      ]
    },
    'OPERATOR/TRADER': {
      title: 'Desk Operator / Paper Trader',
      description: 'Tactical execution role for reviewing Got One setups and monitoring active positions.',
      permissions: [
        'Approve or decline paper trade setups',
        'Close active paper positions',
        'Trigger hard stops & Emergency Exit'
      ],
      restrictions: [
        'Cannot alter global risk caps or strategy drift thresholds',
        'Cannot view server environment secrets'
      ]
    },
    'STANDARD USER': {
      title: 'Observer / Standard User',
      description: 'Read-only public observer. Can inspect live operations, money map, and intelligence briefs.',
      permissions: [
        'View live paper positions & portfolio metrics',
        'Read daily intelligence briefs & explainers',
        'Inspect worker status'
      ],
      restrictions: [
        'CANNOT approve or execute trades',
        'CANNOT modify risk limits or change configs',
        'CANNOT view secrets or trigger emergency commands'
      ]
    }
  };

  return (
    <AnimatePresence>
      <div id="auth-role-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#0d0c0a] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-black">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Authentication & Role Governance</h3>
                <p className="text-xs text-amber-300/80">Backend-enforced permission envelopes</p>
              </div>
            </div>
            <button
              id="close-auth-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{notification}</span>
              </motion.div>
            )}

            {/* Current Active Session Card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">Authenticated Identity</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {currentUser?.role || 'OWNER/ADMIN'}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black text-sm">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'OP'}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentUser?.name || 'Chief Operator'}</div>
                  <div className="text-xs text-neutral-400 font-mono">{currentUser?.email || 'teaj35224@gmail.com'}</div>
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Active Role</label>
                <span className="text-[11px] text-neutral-400">Enforced on backend API routes</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['OWNER/ADMIN', 'DEVELOPER', 'OPERATOR/TRADER', 'STANDARD USER'] as UserRole[]).map((r) => {
                  const isSelected = r === selectedRole;
                  return (
                    <button
                      key={r}
                      id={`role-btn-${r.toLowerCase().replace(/[^a-z]/g, '-')}`}
                      disabled={isUpdating}
                      onClick={() => handleRoleSwitch(r)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-950/60 to-neutral-900 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold tracking-wider">{r}</span>
                        {isSelected && <UserCheck className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2">
                        {roleDefinitions[r].description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Deep-Dive */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {roleDefinitions[selectedRole].title}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-300">
                  Permission Envelope
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Granted Capabilities:
                </span>
                <ul className="text-xs text-neutral-300 space-y-1 pl-5 list-disc marker:text-emerald-500">
                  {roleDefinitions[selectedRole].permissions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Enforced Security Restrictions:
                </span>
                <ul className="text-xs text-neutral-300 space-y-1 pl-5 list-disc marker:text-amber-500">
                  {roleDefinitions[selectedRole].restrictions.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-300 leading-relaxed">
                <strong className="text-amber-300">Absolute Safety Rule:</strong> Live real-money trading is disabled by architecture. All order executions are routed exclusively to the Alpaca Paper sandbox.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Security Engine: Nominal</span>
            <button
              id="close-auth-role-footer-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider transition-colors"
            >
              APPLY & CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
