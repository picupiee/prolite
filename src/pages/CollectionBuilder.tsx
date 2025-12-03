import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { collectionService } from '../services/collectionService';
import type { FieldDefinition, FieldType, FieldConfig } from '../types/dataCollection';

export const CollectionBuilder = () => {
  const { projectId, collectionId } = useParams<{ projectId: string; collectionId: string }>();
  const navigate = useNavigate();
  const [collectionName, setCollectionName] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadCollection = async () => {
    if (!collectionId) return;

    try {
      const collection = await collectionService.getById(collectionId);
      if (collection) {
        setCollectionName(collection.name);
      }

      const existingFields = await collectionService.getFields(collectionId);
      setFields(existingFields);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    const newField: FieldDefinition = {
      id: `temp_${Date.now()}`,
      collectionId: collectionId!,
      name: '',
      type: 'string',
      config: {},
      order: fields.length,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!collectionId) return;

    setIsSaving(true);
    try {
      // Delete existing fields
      const existingFields = await collectionService.getFields(collectionId);
      await Promise.all(existingFields.map(f => collectionService.deleteField(f.id)));

      // Add new fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        await collectionService.addField({
          collectionId,
          name: field.name,
          type: field.type,
          config: field.config,
          order: i,
          required: field.required,
        });
      }

      navigate(`/projects/${projectId}/collections`);
    } catch (error) {
      console.error('Error saving fields:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold">{collectionName}</h1>
            <p className="text-muted-foreground mt-1">Configure your data fields</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || fields.length === 0}>
          <Save size={20} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Fields'}
        </Button>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No fields yet. Add your first field to get started.</p>
              <Button onClick={addField}>
                <Plus size={20} className="mr-2" />
                Add Field
              </Button>
            </div>
          ) : (
            <>
              {fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => updateField(index, updates)}
                  onRemove={() => removeField(index)}
                />
              ))}
              <Button onClick={addField} variant="secondary" className="w-full">
                <Plus size={20} className="mr-2" />
                Add Another Field
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

interface FieldEditorProps {
  field: FieldDefinition;
  onUpdate: (updates: Partial<FieldDefinition>) => void;
  onRemove: () => void;
}

const FieldEditor = ({ field, onUpdate, onRemove }: FieldEditorProps) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Field Name *</label>
            <input
              type="text"
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g., Customer Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Field Type *</label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value as FieldType, config: {} })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="string">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
              <option value="options">Options (Coming Soon)</option>
            </select>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-7"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="w-4 h-4 rounded border-input"
          />
          <span className="text-sm">Required field</span>
        </label>
      </div>

      {field.type === 'number' && (
        <NumberFieldConfig
          config={field.config}
          onUpdate={(config) => onUpdate({ config })}
        />
      )}
    </div>
  );
};

interface NumberFieldConfigProps {
  config: FieldConfig;
  onUpdate: (config: FieldConfig) => void;
}

const NumberFieldConfig = ({ config, onUpdate }: NumberFieldConfigProps) => {
  return (
    <div className="border-t border-border pt-4 space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.isCurrency || false}
            onChange={(e) => onUpdate({ ...config, isCurrency: e.target.checked })}
            className="w-4 h-4 rounded border-input"
          />
          <span className="text-sm">Currency field</span>
        </label>

        {config.isCurrency && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Currency:</label>
            <select
              value={config.currencyCode || 'USD'}
              onChange={(e) => onUpdate({ ...config, currencyCode: e.target.value })}
              className="px-3 py-1 border border-input rounded-lg text-sm"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.hasFormula || false}
            onChange={(e) => onUpdate({ ...config, hasFormula: e.target.checked })}
            className="w-4 h-4 rounded border-input"
          />
          <span className="text-sm">Calculated field (formula)</span>
        </label>

        {config.hasFormula && (
          <div>
            <label className="block text-sm font-medium mb-2">Formula</label>
            <input
              type="text"
              value={config.formula || ''}
              onChange={(e) => onUpdate({ ...config, formula: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
              placeholder="e.g., field1 + field2 * 0.1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use field names and operators: +, -, *, /, ()
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
