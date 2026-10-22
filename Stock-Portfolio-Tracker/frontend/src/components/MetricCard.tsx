import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: {
    text: string;
    positive: boolean;
  };
  icon: LucideIcon;
  variant?: 'default' | 'profit' | 'loss' | 'brand';
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  variant = 'default',
  tooltip,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'profit':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accent: 'from-emerald-500/10 to-transparent',
        };
      case 'loss':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/50',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          accent: 'from-rose-500/10 to-transparent',
        };
      case 'brand':
        return {
          border: 'border-brand-500/30 hover:border-brand-500/50',
          iconBg: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
          accent: 'from-brand-500/10 to-transparent',
        };
      default:
        return {
          border: 'border-navy-700/60 hover:border-slate-600',
          iconBg: 'bg-navy-800 text-slate-300 border-navy-700',
          accent: 'from-navy-800/20 to-transparent',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy-850/90 backdrop-blur-sm border ${styles.border} p-5 transition-all duration-200 hover:shadow-xl hover:shadow-navy-950/40 group`}
      title={tooltip}
    >
      {/* Subtle top gradient glow */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <span className="text-xs font-medium tracking-wide uppercase text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white truncate">
            {value}
          </div>
        </div>

        {/* Icon box */}
        <div
          className={`shrink-0 p-3 rounded-xl border ${styles.iconBg} transition-transform group-hover:scale-105`}
        >
          <Icon size={22} />
        </div>
      </div>

      {/* Footer / Subtitle & Badge */}
      <div className="mt-4 pt-3 border-t border-navy-700/40 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-400 truncate text-[11px]">
            {subtitle}
          </span>
        )}

        {badge && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
              badge.positive
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {badge.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{badge.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
