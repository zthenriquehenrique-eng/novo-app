import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  gradient: string;
  target?: number;
}

export function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  gradient,
  target,
}: StatsCardProps) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-medium text-slate-600">
          {title}
        </span>
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-1 sm:gap-2 mb-3 sm:mb-4">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
          {value}
        </span>
        <span className="text-sm sm:text-base text-slate-500">{unit}</span>
      </div>
      {target && (
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500">Meta: {target}{unit}</span>
            <span className="font-medium text-slate-700">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
