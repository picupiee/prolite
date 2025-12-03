import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Table, Edit, Trash2, ArrowLeft, MoreVertical } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { collectionService } from '../services/collectionService';
import type { Collection } from '../types/dataCollection';

export const Collections = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  useEffect(() => {
    if (projectId) {
      loadCollections();
    }
  }, [projectId]);

  const loadCollections = async () => {
    if (!projectId) return;

    try {
      const data = await collectionService.getByProject(projectId);
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    navigate(`/projects/${projectId}/collections/${collectionId}/data`);
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? All data will be lost.')) return;

    try {
      await collectionService.delete(collectionId);
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your data tables
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus size={20} className="mr-2" />
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card className="p-12 text-center">
          <Table size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to start organizing data
          </p>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={20} className="mr-2" />
            Create Collection
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleCollectionClick(collection.id)}
              onRefresh={loadCollections}
              onEdit={setEditingCollection}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showNewModal && projectId && (
        <NewCollectionModal
          projectId={projectId}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            loadCollections();
          }}
        />
      )}

      {editingCollection && (
        <EditCollectionModal
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onSuccess={() => {
            setEditingCollection(null);
            loadCollections();
          }}
        />
      )}
    </div>
  );
};

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
  onRefresh: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collectionId: string) => void;
}

const CollectionCard = ({ collection, onClick, onRefresh, onEdit, onDelete }: CollectionCardProps) => {
  const [fieldCount, setFieldCount] = useState(0);

  useEffect(() => {
    loadFieldCount();
  }, [collection.id]);

  const loadFieldCount = async () => {
    try {
      const fields = await collectionService.getFields(collection.id);
      setFieldCount(fields.length);
    } catch (error) {
      console.error('Error loading field count:', error);
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Table size={24} className="text-primary" />
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(collection)}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Edit Collection"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(collection.id)}
              className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
              title="Delete Collection"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {collection.description || 'No description'}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{fieldCount} {fieldCount === 1 ? 'field' : 'fields'}</span>
        </div>
      </div>
    </Card>
  );
};

interface NewCollectionModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const NewCollectionModal = ({ projectId, onClose, onSuccess }: NewCollectionModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const collectionId = await collectionService.create(projectId, name, description, []);
      // Navigate to collection builder to add fields
      navigate(`/projects/${projectId}/collections/${collectionId}/builder`);
    } catch (err: any) {
      console.error('Error creating collection:', err);
      setError(err.message || 'Failed to create collection');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Collection</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Customer Data"
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
                placeholder="What data will this collection store?"
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
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create & Add Fields'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
