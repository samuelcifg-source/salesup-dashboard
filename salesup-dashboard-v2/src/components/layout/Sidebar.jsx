import { TABS } from '../../config/constants';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-44 bg-neutral-950 border-r border-neutral-800 flex flex-col py-4 px-2 gap-1 shrink-0">
      <div className="text-yellow-400 font-extrabold text-lg mb-6 px-2">SALESUP</div>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`w-full h-10 rounded-lg flex items-center gap-3 px-3 text-sm font-semibold transition-all ${
            activeTab === tab.id
              ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_8px_rgba(255,215,0,0.3)]'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-base shrink-0">{tab.icon}</span>
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
