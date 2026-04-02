import { useAuth } from '../../context/AuthContext';
import { TABS } from '../../config/constants';

export default function Header({ activeTab }) {
  const { user, signOut } = useAuth();
  const tab = TABS.find(t => t.id === activeTab);

  return (
    <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-yellow-400 font-extrabold text-sm">SALESUP</span>
        <span className="text-neutral-600">|</span>
        <span className="text-white font-semibold text-sm">{tab?.icon} {tab?.label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-neutral-500 text-xs">{user?.email}</span>
        <button onClick={signOut} className="text-neutral-500 hover:text-red-400 text-xs font-semibold transition">Salir</button>
      </div>
    </div>
  );
}
