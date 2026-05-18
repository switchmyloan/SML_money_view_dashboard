import React from 'react';
import { Info, Database, GitBranch } from 'lucide-react';

const Section = ({ icon: Icon, title, items, accent }) => (
  <div className="flex-1 min-w-[260px]">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent.bg}`}>
        <Icon className={`w-4 h-4 ${accent.text}`} />
      </div>
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
    </div>
    <ul className="space-y-1.5 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 leading-snug">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FlowStrip = ({ steps }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <span className="inline-flex items-center px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 text-[11px] font-medium rounded-md shadow-sm">
          {s}
        </span>
        {i < steps.length - 1 && (
          <span className="text-indigo-400 text-xs font-bold">→</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

const ModuleInfoCard = ({
  title = 'About This Module',
  subtitle,
  whatYouSee = [],
  dataSource = [],
  flow = [],
}) => {
  return (
    <div className="mt-6 mb-2 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-indigo-100/70 bg-white/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Info className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-6">
          <Section
            icon={Info}
            title="What this page shows"
            items={whatYouSee}
            accent={{ bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' }}
          />
          <Section
            icon={Database}
            title="Data source"
            items={dataSource}
            accent={{ bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' }}
          />
        </div>

        {flow.length > 0 && (
          <div className="mt-5 pt-4 border-t border-indigo-100/70">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Flow</h4>
            </div>
            <FlowStrip steps={flow} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleInfoCard;
