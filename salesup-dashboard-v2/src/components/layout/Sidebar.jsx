import { TABS } from '../../config/constants';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-16 bg-neutral-950 border-r border-neutral-800 flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="text-yellow-400 font-extrabold text-lg mb-6">S</div>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          title={tab.label}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
            activeTab === tab.id
              ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_8px_rgba(255,215,0,0.3)]'
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
