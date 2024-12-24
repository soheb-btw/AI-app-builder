import React, { useState } from 'react';

interface TabProps {
  label: string;
  children: React.ReactNode;
  onSelect?: () => void;
}

interface TabViewProps {
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => children;

export const TabView: React.FC<TabViewProps> & { Tab: typeof Tab } = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = React.Children.toArray(children);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-700">
        {tabs.map((tab: any, index) => (
          <button
            key={index}
            className={`px-4 py-2 ${
              activeTab === index
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => {
              setActiveTab(index);
              tab.props.onSelect?.();
            }}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs.map((tab, index) => (
          <div key={index} style={{ display: activeTab === index ? 'block' : 'none' }}>
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
};

TabView.Tab = Tab;