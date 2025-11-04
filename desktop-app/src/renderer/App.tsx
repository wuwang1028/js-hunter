// JS Hunter Desktop - Main App Component
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FileManager from './pages/FileManager';
import AnalysisConfig from './pages/AnalysisConfig';
import ResultsViewer from './pages/ResultsViewer';
import CodeViewer from './pages/CodeViewer';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import './styles/App.css';

type Page = 'files' | 'analysis' | 'results' | 'code' | 'settings' | 'projects';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('files');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'files':
        return <FileManager onSelectFile={setSelectedFileId} />;
      case 'analysis':
        return <AnalysisConfig />;
      case 'results':
        return <ResultsViewer />;
      case 'code':
        return <CodeViewer fileId={selectedFileId} />;
      case 'settings':
        return <Settings />;
      case 'projects':
        return <Projects />;
      default:
        return <FileManager onSelectFile={setSelectedFileId} />;
    }
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
