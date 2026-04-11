interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function ModalTabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    // <div className="max-w-7xl mx-auto px-6">
    <div className="max-w-[2000px] mx-auto px-10">
    
      <nav className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};