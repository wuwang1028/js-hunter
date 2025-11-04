// JS Hunter Desktop - Projects Page
import React, { useState, useEffect } from 'react';
import '../styles/Projects.css';

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  resultCount: number;
  createdAt: number;
  updatedAt: number;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await window.electronAPI.getProjects();
      setProjects(data.projects);
      setCurrentProject(data.currentProjectId);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('请输入项目名称');
      return;
    }

    try {
      await window.electronAPI.createProject({
        name: newProjectName,
        description: newProjectDesc,
      });
      setShowCreateDialog(false);
      setNewProjectName('');
      setNewProjectDesc('');
      await loadProjects();
    } catch (error) {
      console.error('Create project failed:', error);
      alert('创建失败');
    }
  };

  const handleSwitchProject = async (projectId: string) => {
    try {
      await window.electronAPI.switchProject(projectId);
      setCurrentProject(projectId);
      alert('已切换项目');
    } catch (error) {
      console.error('Switch project failed:', error);
      alert('切换失败');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('确定要删除这个项目吗？所有文件和分析结果都将被删除。')) {
      try {
        await window.electronAPI.deleteProject(projectId);
        await loadProjects();
      } catch (error) {
        console.error('Delete project failed:', error);
        alert('删除失败');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="projects">
      <header className="page-header">
        <h2>项目管理</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateDialog(true)}
        >
          ➕ 新建项目
        </button>
      </header>

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-card ${
              currentProject === project.id ? 'current' : ''
            }`}
          >
            {currentProject === project.id && (
              <div className="current-badge">当前项目</div>
            )}
            
            <div className="project-header">
              <h3>{project.name}</h3>
              <p className="project-description">{project.description}</p>
            </div>

            <div className="project-stats">
              <div className="stat">
                <span className="stat-label">文件</span>
                <span className="stat-value">{project.fileCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">分析结果</span>
                <span className="stat-value">{project.resultCount}</span>
              </div>
            </div>

            <div className="project-meta">
              <p>创建于: {formatDate(project.createdAt)}</p>
              <p>更新于: {formatDate(project.updatedAt)}</p>
            </div>

            <div className="project-actions">
              {currentProject !== project.id && (
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSwitchProject(project.id)}
                >
                  切换到此项目
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteProject(project.id)}
                disabled={currentProject === project.id}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateDialog && (
        <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>新建项目</h3>
            
            <div className="form-group">
              <label>项目名称</label>
              <input
                type="text"
                className="form-control"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="输入项目名称"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>项目描述（可选）</label>
              <textarea
                className="form-control"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="输入项目描述"
                rows={3}
              />
            </div>

            <div className="dialog-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateProject}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
