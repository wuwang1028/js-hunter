// JS Hunter Desktop - Sidebar Component
import React from 'react';
import '../styles/Sidebar.css';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'files', icon: '📁', label: '文件管理' },
    { id: 'analysis', icon: '🔍', label: '分析配置' },
    { id: 'results', icon: '📊', label: '分析结果' },
    { id: 'code', icon: '💻', label: '代码查看' },
    { id: 'projects', icon: '📦', label: '项目管理' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">🎯 JS Hunter</h1>
        <p className="app-subtitle">Desktop</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
