import { useState, useCallback, useEffect } from 'react';
import { FormField } from '@/types/form';

interface HistoryState {
  past: FormField[][];
  present: FormField[];
  future: FormField[][];
}

interface UseFormHistoryOptions {
  maxHistorySize?: number;
  autosaveInterval?: number;
  onAutosave?: (fields: FormField[]) => Promise<void>;
}

export const useFormHistory = (
  initialFields: FormField[],
  options: UseFormHistoryOptions = {}
) => {
  const {
    maxHistorySize = 50,
    autosaveInterval = 30000, // 30 seconds
    onAutosave,
  } = options;

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialFields,
    future: [],
  });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [batchOperations, setBatchOperations] = useState<boolean>(false);

  // Autosave functionality
  useEffect(() => {
    if (!onAutosave) return;

    const timer = setInterval(async () => {
      if (isSaving) return;

      const lastModified = new Date(Math.max(
        ...history.present.map(field => field.lastModified?.getTime() || 0)
      ));

      if (lastModified > lastSaved) {
        setIsSaving(true);
        try {
          await onAutosave(history.present);
          setLastSaved(new Date());
        } finally {
          setIsSaving(false);
        }
      }
    }, autosaveInterval);

    return () => clearInterval(timer);
  }, [history.present, lastSaved, isSaving, onAutosave, autosaveInterval]);

  // Add new state to history
  const pushHistory = useCallback((newFields: FormField[]) => {
    setHistory(curr => {
      const newPast = [...curr.past, curr.present].slice(-maxHistorySize);
      return {
        past: newPast,
        present: newFields,
        future: [],
      };
    });
  }, [maxHistorySize]);

  // Undo last change
  const undo = useCallback(() => {
    setHistory(curr => {
      if (curr.past.length === 0) return curr;

      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  // Redo last undone change
  const redo = useCallback(() => {
    setHistory(curr => {
      if (curr.future.length === 0) return curr;

      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Start batch operations
  const startBatch = useCallback(() => {
    setBatchOperations(true);
  }, []);

  // End batch operations and push to history
  const endBatch = useCallback((fields: FormField[]) => {
    setBatchOperations(false);
    pushHistory(fields);
  }, [pushHistory]);

  // Update fields with history tracking
  const updateFields = useCallback((
    newFields: FormField[] | ((prev: FormField[]) => FormField[])
  ) => {
    const fieldsWithTimestamp = (Array.isArray(newFields) ? newFields : newFields(history.present))
      .map(field => ({
        ...field,
        lastModified: new Date(),
      }));

    if (!batchOperations) {
      pushHistory(fieldsWithTimestamp);
    }
    
    setHistory(curr => ({
      ...curr,
      present: fieldsWithTimestamp,
    }));
  }, [batchOperations, pushHistory]);

  return {
    fields: history.present,
    updateFields,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isSaving,
    startBatch,
    endBatch,
    lastSaved,
  };
};

export default useFormHistory;
