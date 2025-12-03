import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { collectionService } from '../services/collectionService';
import { recordService } from '../services/recordService';
import { useAuthStore } from '../store/useAuthStore';
import type { Collection, FieldDefinition, DataRecord } from '../types/dataCollection';

export const DataEntry = () => {
  const { projectId, collectionId } = useParams<{ projectId: string; collectionId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);

  useEffect(() => {
    if (collectionId) {
      loadData();
    }
  }, [collectionId]);

  const loadData = async () => {
    if (!collectionId) return;

    try {
      const [collectionData, fieldsData] = await Promise.all([
        collectionService.getById(collectionId),
        collectionService.getFields(collectionId),
      ]);

      setCollection(collectionData);
      setFields(fieldsData);

      // Load records separately with error handling
      try {
        const recordsData = await recordService.getByCollection(collectionId);
        setRecords(recordsData);
      } catch (recordError) {
        console.log('No records or permission issue:', recordError);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: DataRecord) => {
    setEditingRecord(record);
    setShowRecordModal(true);
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await recordService.delete(recordId);
      loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${projectId}/collections`)}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground mt-1">{records.length} records</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${projectId}/collections/${collectionId}/builder`)}
          >
            Manage Fields
          </Button>
          <Button onClick={() => { setEditingRecord(null); setShowRecordModal(true); }}>
            <Plus size={20} className="mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No fields configured</h3>
          <p className="text-muted-foreground mb-4">
            Add fields to your collection before entering data
          </p>
          <Button onClick={() => navigate(`/projects/${projectId}/collections/${collectionId}/builder`)}>
            Configure Fields
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {fields.map((field) => (
                    <th key={field.id} className="px-4 py-3 text-left text-sm font-medium">
                      {field.name}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      No records yet. Click "Add Record" to get started.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                      {fields.map((field) => (
                        <td key={field.id} className="px-4 py-3 text-sm">
                          {formatFieldValue(record.data[field.id], field)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showRecordModal && projectId && collectionId && user && (
        <RecordModal
          projectId={projectId}
          collectionId={collectionId}
          fields={fields}
          record={editingRecord}
          userId={user.id}
          onClose={() => {
            setShowRecordModal(false);
            setEditingRecord(null);
          }}
          onSuccess={() => {
            setShowRecordModal(false);
            setEditingRecord(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const formatFieldValue = (value: any, field: FieldDefinition): string => {
  if (value === null || value === undefined) return '-';

  switch (field.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
      if (field.config.isCurrency) {
        const symbol = getCurrencySymbol(field.config.currencyCode || 'USD');
        return `${symbol}${Number(value).toFixed(2)}`;
      }
      return String(value);
    default:
      return String(value);
  }
};

const getCurrencySymbol = (code: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  return symbols[code] || code;
};

interface RecordModalProps {
  projectId: string;
  collectionId: string;
  fields: FieldDefinition[];
  record: DataRecord | null;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RecordModal = ({ projectId, collectionId, fields, record, userId, onClose, onSuccess }: RecordModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData(record.data);
    } else {
      // Initialize with empty values
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.id] = field.type === 'boolean' ? false : '';
      });
      setFormData(initialData);
    }
  }, [record, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (record) {
        await recordService.update(record.id, formData);
      } else {
        await recordService.create(collectionId, projectId, formData, userId);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving record:', err);
      setError(err.message || 'Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {record ? 'Edit Record' : 'Add New Record'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(value) => setFormData({ ...formData, [field.id]: value })}
              />
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? 'Saving...' : record ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

interface FieldInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}

const FieldInput = ({ field, value, onChange }: FieldInputProps) => {
  switch (field.type) {
    case 'boolean':
      return (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <span className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </span>
          </label>
        </div>
      );

    case 'number':
      if (field.config.hasFormula) {
        return (
          <div>
            <label className="block text-sm font-medium mb-2">
              {field.name} (Calculated)
            </label>
            <input
              type="text"
              value={value || '0'}
              disabled
              className="w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formula: {field.config.formula}
            </p>
          </div>
        );
      }

      return (
        <Input
          label={field.name}
          type="number"
          step="any"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          required={field.required}
        />
      );

    default:
      return (
        <Input
          label={field.name}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );
  }
};
