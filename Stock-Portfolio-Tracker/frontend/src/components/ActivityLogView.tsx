import React from 'react';
import type { ActivityItem } from '../types/portfolio';
import { History, PlusCircle, Edit, Trash2, RotateCcw } from 'lucide-react';

interface ActivityLogViewProps {
  activity: ActivityItem[];
  onClearActivity: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  activity,
  onClearActivity,
}) => {
  const getActionBadge = (action: ActivityItem['action']) => {
    switch (action) {
      case 'ADD':
        return {
          icon: PlusCircle,
          label: 'Added Position',
          styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'EDIT':
        return {
          icon: Edit,
          label: 'Updated Position',
          styles: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
        };
      case 'DELETE':
        return {
          icon: Trash2,
          label: 'Removed Position',
          styles: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      case 'RESET':
        return {
          icon: RotateCcw,
          label: 'Portfolio Reset',
          styles: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      default:
        return {
          icon: History,
          label: 'Action',
          styles: 'bg-navy-800 text-slate-300 border-navy-700',
        };
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="rounded-2xl bg-navy-850/90 backdrop-blur-sm border border-navy-700/60 p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-700/50">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <History size={18} className="text-brand-400" />
            <span>Portfolio Activity Log</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of your recent additions, modifications, and removals
          </p>
        </div>

        {activity.length > 0 && (
          <button
            onClick={onClearActivity}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Activity List */}
      {activity.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No recent activity recorded.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {activity.map((item) => {
            const badge = getActionBadge(item.action);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-navy-900/60 border border-navy-700/40 hover:border-navy-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg border ${badge.styles} shrink-0 mt-0.5`}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {item.symbol}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${badge.styles}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{item.details}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono shrink-0">
                  {formatDate(item.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
