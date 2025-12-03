import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Users, Calendar } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { projectService } from '../services/projectService';
import { projectMemberService } from '../services/projectMemberService';
import { useAuthStore } from '../store/useAuthStore';
import type { Project } from '../types/dataCollection';

export const Projects = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      const userProjects = await projectService.getUserProjects(user.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    // Store current project in localStorage for persistence
    localStorage.setItem('currentProjectId', projectId);
    navigate(`/projects/${projectId}/collections`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your data collection projects
          </p>
        </div>
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus size={20} className="mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start collecting data
          </p>
          <Button onClick={() => setShowNewProjectModal(true)}>
            <Plus size={20} className="mr-2" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>
      )}

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={() => {
            setShowNewProjectModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    loadMemberCount();
  }, [project.id]);

  const loadMemberCount = async () => {
    try {
      const members = await projectMemberService.getProjectMembers(project.id);
      setMemberCount(members.length);
    } catch (error) {
      console.error('Error loading member count:', error);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FolderOpen size={24} className="text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description || 'No description'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{project.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewProjectModal = ({ onClose, onSuccess }: NewProjectModalProps) => {
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    setError('');

    try {
      await projectService.create(name, description, user.id);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Project</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="My Data Collection Project"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                rows={3}
                placeholder="What will you collect in this project?"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
