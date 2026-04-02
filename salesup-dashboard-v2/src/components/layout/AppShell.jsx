import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ activeTab, setActiveTab, children }) {
  return (
    <div className="h-screen flex bg-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
