/**
 * Paydos CRM - Custom Hooks
 * 
 * Reusable React hooks for common functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================
// useLocalStorage - Persist state to localStorage
// ============================================================
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`useLocalStorage error for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`useLocalStorage set error for key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`useLocalStorage remove error for key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ============================================================
// useSessionStorage - Persist state to sessionStorage
// ============================================================
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`useSessionStorage error for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`useSessionStorage set error for key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ============================================================
// useDebounce - Debounce a value
// ============================================================
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// useDebouncedCallback - Debounce a callback function
// ============================================================
export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// ============================================================
// useModal - Modal state management
// ============================================================
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState(null);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, data, open, close, toggle };
}

// ============================================================
// useConfirm - Confirmation dialog state
// ============================================================
export function useConfirm() {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger',
  });

  const confirm = useCallback(({ title, message, onConfirm, variant = 'danger' }) => {
    setState({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm?.();
    close();
  }, [state.onConfirm, close]);

  return {
    ...state,
    confirm,
    close,
    handleConfirm,
  };
}

// ============================================================
// useToast - Toast notification management
// ============================================================
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// ============================================================
// useFetch - Data fetching with loading/error states
// ============================================================
export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

// ============================================================
// useAsync - Execute async function with loading/error states
// ============================================================
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (result?.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }
      return { success: true, data: result?.data || result };
    } catch (err) {
      const errorMsg = err.message || 'Bir hata oluştu';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
}

// ============================================================
// useForm - Form state management
// ============================================================
export function useForm(initialValues = {}, validate = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    // Validate if validator provided
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setFieldError,
    setValues,
    reset,
  };
}

// ============================================================
// useSearch - Search/filter functionality
// ============================================================
export function useSearch(items, searchFields, initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;

    const searchLower = debouncedQuery.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [items, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    filteredItems,
    resultCount: filteredItems.length,
  };
}

// ============================================================
// useSelection - Multi-select functionality
// ============================================================
export function useSelection(items = []) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggle = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    selectedItems,
    selectedCount: selectedIds.length,
    hasSelection: selectedIds.length > 0,
    allSelected: selectedIds.length === items.length && items.length > 0,
  };
}

// ============================================================
// usePagination - Pagination state
// ============================================================
export function usePagination(items, pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  // Reset to page 1 when items change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, items.length),
    totalItems: items.length,
  };
}

// ============================================================
// useClickOutside - Detect clicks outside element
// ============================================================
export function useClickOutside(callback) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// ============================================================
// useKeyPress - Detect key press
// ============================================================
export function useKeyPress(targetKey, callback) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === targetKey) {
        callback(e);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, callback]);
}

// ============================================================
// usePrevious - Get previous value
// ============================================================
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// ============================================================
// useWindowSize - Track window dimensions
// ============================================================
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ============================================================
// useOnlineStatus - Track online/offline status
// ============================================================
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default {
  useLocalStorage,
  useSessionStorage,
  useDebounce,
  useDebouncedCallback,
  useModal,
  useConfirm,
  useToast,
  useFetch,
  useAsync,
  useForm,
  useSearch,
  useSelection,
  usePagination,
  useClickOutside,
  useKeyPress,
  usePrevious,
  useWindowSize,
  useOnlineStatus,
};
