/**
 * Paydos CRM - Reusable UI Components
 * 
 * Tüm ortak UI komponentleri burada. Feature modülleri bunları import eder.
 */

import React, { useState, useEffect, useRef } from 'react';
import { COLORS, STATUS_COLORS } from '../../utils/constants';

// ============================================================
// BUTTON COMPONENT
// ============================================================
export function Button({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, success, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 18px', fontSize: '14px' },
    lg: { padding: '14px 24px', fontSize: '16px' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: COLORS.primary,
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #e5e7eb',
    },
    danger: {
      backgroundColor: COLORS.danger,
      color: 'white',
    },
    success: {
      backgroundColor: COLORS.success,
      color: 'white',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{ 
          width: '16px', 
          height: '16px', 
          border: '2px solid transparent',
          borderTopColor: 'currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      ) : icon}
      {children}
    </button>
  );
}

// ============================================================
// INPUT COMPONENT
// ============================================================
export function Input({
  label,
  error,
  icon = null,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputRef = useRef(null);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: icon ? '10px 12px 10px 40px' : '10px 12px',
    fontSize: '14px',
    border: `1px solid ${error ? COLORS.danger : '#e5e7eb'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: disabled ? '#f9fafb' : 'white',
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    pointerEvents: 'none',
  };

  const errorStyle = {
    fontSize: '12px',
    color: COLORS.danger,
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: COLORS.danger }}> *</span>}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? COLORS.danger : '#e5e7eb';
          }}
          {...props}
        />
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

// ============================================================
// SELECT COMPONENT
// ============================================================
export function Select({
  label,
  error,
  value,
  onChange,
  options = [], // [{ value: 'x', label: 'X' }]
  placeholder = 'Seçiniz...',
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${error ? COLORS.danger : '#e5e7eb'}`,
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: disabled ? '#f9fafb' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          {label}
          {required && <span style={{ color: COLORS.danger }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={selectStyle}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: COLORS.danger }}>{error}</span>}
    </div>
  );
}

// ============================================================
// TEXTAREA COMPONENT
// ============================================================
export function Textarea({
  label,
  error,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const textareaStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${error ? COLORS.danger : '#e5e7eb'}`,
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: disabled ? '#f9fafb' : 'white',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          {label}
          {required && <span style={{ color: COLORS.danger }}> *</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        style={textareaStyle}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: COLORS.danger }}>{error}</span>}
    </div>
  );
}

// ============================================================
// BADGE COMPONENT
// ============================================================
export function Badge({
  children,
  variant = 'default', // default, success, warning, danger, info
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantColors = {
    default: { bg: '#f3f4f6', color: '#374151' },
    success: { bg: '#dcfce7', color: '#166534' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    danger: { bg: '#fee2e2', color: '#991b1b' },
    info: { bg: '#dbeafe', color: '#1e40af' },
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 10px', fontSize: '12px' },
    lg: { padding: '6px 14px', fontSize: '14px' },
  };

  const { bg, color } = variantColors[variant] || variantColors.default;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bg,
        color: color,
        borderRadius: '9999px',
        fontWeight: '500',
        ...sizeStyles[size],
      }}
      className={className}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      )}
      {children}
    </span>
  );
}

// ============================================================
// STATUS BADGE (for Visa, Tour, Hotel statuses)
// ============================================================
export function StatusBadge({ status, type = 'visa' }) {
  const colorMap = STATUS_COLORS[type] || {};
  const colors = colorMap[status] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {status}
    </span>
  );
}

// ============================================================
// CARD COMPONENT
// ============================================================
export function Card({
  children,
  title,
  subtitle,
  actions,
  padding = true,
  className = '',
  style = {},
}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: padding ? '20px' : 0 }}>{children}</div>
    </div>
  );
}

// ============================================================
// MODAL COMPONENT
// ============================================================
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg, xl, full
  closeOnOverlay = true,
}) {
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '560px' },
    lg: { maxWidth: '720px' },
    xl: { maxWidth: '900px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          ...sizeStyles[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '20px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message,
  confirmText = 'Evet',
  cancelText = 'İptal',
  variant = 'danger', // danger, warning, info
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: '#4b5563', margin: '0 0 20px 0' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

// ============================================================
// TABLE COMPONENT
// ============================================================
export function Table({
  columns, // [{ key: 'name', header: 'Ad', render?: (row) => ... }]
  data = [],
  onRowClick,
  selectedIds = [],
  onSelect,
  loading = false,
  emptyMessage = 'Kayıt bulunamadı',
}) {
  const selectAll = () => {
    if (onSelect) {
      if (selectedIds.length === data.length) {
        onSelect([]);
      } else {
        onSelect(data.map((row) => row.id));
      }
    }
  };

  const toggleSelect = (id) => {
    if (onSelect) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter((x) => x !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {onSelect && (
              <th style={{ padding: '12px 16px', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={selectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: selectedIds.includes(row.id) ? '#f0f9ff' : 'white',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!selectedIds.includes(row.id)) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.includes(row.id)) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {onSelect && (
                <td style={{ padding: '12px 16px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(row.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// TABS COMPONENT
// ============================================================
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: activeTab === tab.key ? '600' : '500',
            color: activeTab === tab.key ? COLORS.primary : '#6b7280',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.key ? `2px solid ${COLORS.primary}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-1px',
          }}
        >
          {tab.icon && <span style={{ marginRight: '8px' }}>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: activeTab === tab.key ? COLORS.primary : '#e5e7eb',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                borderRadius: '9999px',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// SEARCH INPUT
// ============================================================
export function SearchInput({ value, onChange, placeholder = 'Ara...', className = '' }) {
  return (
    <div style={{ position: 'relative' }} className={className}>
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
        }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px 10px 40px',
          fontSize: '14px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          outline: 'none',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</span>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0', maxWidth: '400px' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ============================================================
// LOADING SPINNER
// ============================================================
export function Spinner({ size = 'md', color = COLORS.primary }) {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '40px',
  };

  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        border: `2px solid #e5e7eb`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

// ============================================================
// TOAST / NOTIFICATION (Simple)
// ============================================================
export function Toast({ message, type = 'info', onClose }) {
  const colors = {
    success: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
    error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  };

  const { bg, border, text } = colors[type] || colors.info;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: bg,
        borderLeft: `4px solid ${border}`,
        borderRadius: '8px',
        color: text,
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: text,
          fontSize: '16px',
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ============================================================
// FORM ROW (for inline fields)
// ============================================================
export function FormRow({ children, columns = 2 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// DROPDOWN MENU
// ============================================================
export function DropdownMenu({ trigger, items, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            [align]: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '160px',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {items.map((item, idx) =>
            item.divider ? (
              <div
                key={idx}
                style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }}
              />
            ) : (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: item.danger ? COLORS.danger : '#374151',
                  backgroundColor: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CSS KEYFRAMES (inject once)
// ============================================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
if (!document.getElementById('paydos-ui-styles')) {
  styleSheet.id = 'paydos-ui-styles';
  document.head.appendChild(styleSheet);
}

export default {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  StatusBadge,
  Card,
  Modal,
  ConfirmDialog,
  Table,
  Tabs,
  SearchInput,
  EmptyState,
  Spinner,
  Toast,
  FormRow,
  DropdownMenu,
};
