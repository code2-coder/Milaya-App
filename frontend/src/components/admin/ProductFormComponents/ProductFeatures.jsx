import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, ListChecks } from 'lucide-react';

function SortableFeature({ feature, index, onUpdate, onDelete, onEnter }) {
  const inputRef = useRef(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `feature-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (inputRef.current && index === onEnter) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  }, [index, onEnter]);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
        <span className="text-xs font-bold text-amber-700">{index + 1}</span>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={feature}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder="Enter a product feature..."
        maxLength={120}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all"
      />
      <span className="text-xs text-gray-400 flex-shrink-0">{feature.length}/120</span>
      <button
        type="button"
        onClick={() => onDelete(index)}
        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Delete feature"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProductFeatures() {
  const { setValue, watch, register, formState: { errors } } = useFormContext();
  const watchedFeatures = watch('features');
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState('');
  const [focusIndex, setFocusIndex] = useState(null);
  const focusTimeoutRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    register("features", {
      validate: (val) => {
        const valid = val ? val.filter(f => f.trim().length > 0) : [];
        return valid.length > 0 || "At least one Product Feature is required";
      }
    });
  }, [register]);

  useEffect(() => {
    if (Array.isArray(watchedFeatures)) {
      setFeatures(watchedFeatures);
    }
  }, [watchedFeatures]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  const syncForm = useCallback((updatedFeatures) => {
    setFeatures(updatedFeatures);
    setValue('features', updatedFeatures, { shouldDirty: true });
  }, [setValue]);

  const trimAll = (arr) => arr.map(f => f.trim());

  const hasDuplicate = (arr, text, excludeIndex) => {
    const lower = text.toLowerCase();
    return arr.some((f, i) => i !== excludeIndex && f.toLowerCase() === lower);
  };

  const addFeature = () => {
    setError('');
    const updated = [...features, ''];
    syncForm(updated);
    setFocusIndex(updated.length - 1);
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => setFocusIndex(null), 500);
  };

  const updateFeature = (index, value) => {
    if (value.length > 120) return;
    setError('');
    const updated = [...features];
    updated[index] = value;
    syncForm(updated);
  };

  const deleteFeature = (index) => {
    const trimmed = trimAll(features);
    const current = trimmed[index];
    if (current && current.length > 0) {
      if (!window.confirm(`Delete feature "${current}"?`)) return;
    }
    const updated = features.filter((_, i) => i !== index);
    syncForm(updated);
    setError('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = parseInt(active.id.replace('feature-', ''), 10);
    const newIndex = parseInt(over.id.replace('feature-', ''), 10);
    const updated = [...features];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    syncForm(updated);
  };

  const validateFeatures = () => {
    const trimmed = trimAll(features);
    const filtered = trimmed.filter(f => f.length > 0);

    for (const f of filtered) {
      if (f.length > 120) {
        setError(`Feature "${f.substring(0, 30)}..." exceeds 120 characters`);
        return false;
      }
    }

    const seen = new Set();
    for (const f of filtered) {
      const lower = f.toLowerCase();
      if (seen.has(lower)) {
        setError(`Duplicate feature: "${f}"`);
        return false;
      }
      seen.add(lower);
    }

    return true;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <ListChecks className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Product Features *</h3>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={features.map((_, i) => `feature-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {features.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                No features added yet. Click "Add Feature" below.
              </div>
            )}
            {features.map((feature, index) => (
              <SortableFeature
                key={`feature-${index}`}
                feature={feature}
                index={index}
                onUpdate={updateFeature}
                onDelete={deleteFeature}
                onEnter={focusIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {errors.features && (
        <p className="text-red-500 text-xs mt-2 font-medium">{errors.features.message}</p>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
      )}

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
        <span className="text-xs text-gray-400 ml-auto">{features.filter(f => f.trim()).length} feature{(features.filter(f => f.trim()).length !== 1) ? 's' : ''}</span>
      </div>
    </div>
  );
}
