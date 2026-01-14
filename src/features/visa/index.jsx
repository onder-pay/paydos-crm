/**
 * Paydos CRM - Visa Feature Module
 * 
 * Vize başvuru yönetimi: Liste, Form, Detay, Dashboard
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Modal,
  Table,
  SearchInput,
  StatusBadge,
  EmptyState,
  Spinner,
  ConfirmDialog,
  FormRow,
  Badge,
  DropdownMenu,
  Tabs,
} from '../../components/ui';
import { useForm, useSearch, useSelection, usePagination, useModal, useToast, useAsync, useConfirm } from '../../hooks';
import { visaService, customerService } from '../../services/supabase';
import {
  VISA_STATUSES,
  VISA_CATEGORIES,
  SCHENGEN_COUNTRIES,
  UK_VISA_TYPES,
  UK_VISA_DURATIONS,
  RUSSIA_VISA_TYPES,
  UAE_VISA_TYPES,
  DEFAULT_FIRMS,
  STATUS_COLORS,
} from '../../utils/constants';
import {
  formatDate,
  formatCurrency,
  getDaysLeft,
  isAppointmentSoon,
  safeParseNumber,
} from '../../utils/helpers';

// ============================================================
// VISA CATEGORIES SIDEBAR
// ============================================================
export function VisaCategoriesSidebar({ activeCategory, onSelect, counts = {} }) {
  return (
    <div style={{ 
      width: '240px',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
        VİZE KATEGORİLERİ
      </h3>
      
      {Object.entries(VISA_CATEGORIES).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            marginBottom: '4px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeCategory === key ? category.color + '15' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <span style={{ fontSize: '20px' }}>{category.icon}</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: activeCategory === key ? '600' : '500',
              color: activeCategory === key ? category.color : '#374151',
            }}>
              {category.name}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {counts[key] || 0} başvuru
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// VISA STATS CARDS
// ============================================================
export function VisaStatsCards({ visas }) {
  const stats = useMemo(() => {
    const byStatus = {};
    VISA_STATUSES.forEach((s) => { byStatus[s] = 0; });
    
    let upcomingAppointments = 0;
    let totalRevenue = 0;
    let paidAmount = 0;

    visas.forEach((v) => {
      if (byStatus[v.status] !== undefined) {
        byStatus[v.status]++;
      }
      if (v.appointmentDate && isAppointmentSoon(v.appointmentDate)) {
        upcomingAppointments++;
      }
      totalRevenue += safeParseNumber(v.price) || 0;
      paidAmount += safeParseNumber(v.paidAmount) || 0;
    });

    return {
      total: visas.length,
      byStatus,
      upcomingAppointments,
      totalRevenue,
      paidAmount,
      pendingPayment: totalRevenue - paidAmount,
    };
  }, [visas]);

  const statCards = [
    { label: 'Toplam', value: stats.total, icon: '📊', color: '#3b82f6' },
    { label: 'Beklemede', value: stats.byStatus['Beklemede'], icon: '⏳', color: '#f59e0b' },
    { label: 'Randevu Alındı', value: stats.byStatus['Randevu Alındı'], icon: '📅', color: '#8b5cf6' },
    { label: 'Yaklaşan Randevu', value: stats.upcomingAppointments, icon: '🔔', color: '#ef4444' },
    { label: 'Onaylandı', value: stats.byStatus['Onaylandı'], icon: '✅', color: '#22c55e' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {statCards.map((card, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                {card.label}
              </div>
            </div>
            <span style={{ fontSize: '24px' }}>{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// VISA LIST COMPONENT
// ============================================================
export function VisaList({
  visas = [],
  loading = false,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { query, setQuery, filteredItems } = useSearch(visas, ['customerName', 'country', 'passportNo']);
  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(filteredItems, 25);
  const confirm = useConfirm();

  const columns = [
    {
      key: 'customer',
      header: 'Müşteri',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.customerName}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.passportNo || '-'}</div>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Ülke / Vize Tipi',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.country}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.visaType || '-'}</div>
        </div>
      ),
    },
    {
      key: 'appointment',
      header: 'Randevu',
      render: (row) => {
        if (!row.appointmentDate) return <span style={{ color: '#9ca3af' }}>-</span>;
        
        const daysLeft = getDaysLeft(row.appointmentDate);
        const isUrgent = daysLeft >= 0 && daysLeft <= 10;
        
        return (
          <div>
            <div style={{ 
              fontWeight: isUrgent ? '600' : 'normal',
              color: isUrgent ? '#dc2626' : '#111827',
            }}>
              {formatDate(row.appointmentDate)}
            </div>
            {row.appointmentTime && (
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.appointmentTime}</div>
            )}
            {isUrgent && daysLeft >= 0 && (
              <div style={{ fontSize: '11px', color: '#dc2626' }}>
                {daysLeft === 0 ? 'BUGÜN!' : `${daysLeft} gün kaldı`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => <StatusBadge status={row.status} type="visa" />,
    },
    {
      key: 'price',
      header: 'Ücret',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{formatCurrency(row.price, row.currency)}</div>
          {row.paidAmount > 0 && (
            <div style={{ fontSize: '12px', color: '#22c55e' }}>
              Ödenen: {formatCurrency(row.paidAmount, row.currency)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <DropdownMenu
          trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '18px' }}>⋮</button>}
          items={[
            { label: 'Düzenle', icon: '✏️', onClick: () => onEdit(row) },
            { label: 'Durum Güncelle', icon: '🔄', onClick: () => {} },
            { divider: true },
            { label: 'Sil', icon: '🗑️', danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ];

  const handleDelete = (visa) => {
    confirm.confirm({
      title: 'Vize Kaydını Sil',
      message: `${visa.customerName} - ${visa.country} vize kaydını silmek istediğinize emin misiniz?`,
      onConfirm: () => onDelete(visa.id),
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Müşteri, ülke veya pasaport ara..."
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="🛂"
          title="Vize kaydı bulunamadı"
          description={query ? 'Arama kriterlerine uygun kayıt yok' : 'Henüz vize başvurusu eklenmemiş'}
        />
      ) : (
        <>
          <Card padding={false}>
            <Table
              columns={columns}
              data={paginatedItems}
              onRowClick={onSelect}
            />
          </Card>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>←</Button>
              <span style={{ padding: '8px', fontSize: '14px', color: '#6b7280' }}>{currentPage} / {totalPages}</span>
              <Button variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>→</Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
      />
    </div>
  );
}

// ============================================================
// VISA FORM COMPONENT
// ============================================================
export function VisaForm({
  visa = null,
  customers = [],
  onSave,
  onCancel,
  loading = false,
}) {
  const isEditing = !!visa;
  
  const initialValues = visa || {
    customerId: '',
    customerName: '',
    country: '',
    category: 'schengen',
    visaType: '',
    visaDuration: '',
    entryType: 'Tek Giriş',
    status: 'Beklemede',
    appointmentDate: '',
    appointmentTime: '',
    appointmentLocation: '',
    passportNo: '',
    price: '',
    currency: 'EUR',
    paidAmount: '',
    paymentStatus: 'Ödenmedi',
    firm: '',
    notes: '',
    trackingNo: '',
    fileNo: '',
  };

  const { values, handleChange, setValue, errors, setFieldError } = useForm(initialValues);
  const [selectedCategory, setSelectedCategory] = useState(visa?.category || 'schengen');

  // Get country options based on category
  const getCountryOptions = () => {
    switch (selectedCategory) {
      case 'schengen':
        return SCHENGEN_COUNTRIES.map((c) => ({ value: c, label: c }));
      case 'uk':
        return [{ value: 'İngiltere', label: 'İngiltere' }];
      case 'usa':
        return [{ value: 'ABD', label: 'ABD' }];
      case 'russia':
        return [{ value: 'Rusya', label: 'Rusya' }];
      case 'uae':
        return [{ value: 'BAE', label: 'BAE' }];
      default:
        return [];
    }
  };

  // Get visa type options based on category
  const getVisaTypeOptions = () => {
    switch (selectedCategory) {
      case 'schengen':
        return [
          { value: 'Turist', label: 'Turist' },
          { value: 'İş', label: 'İş' },
          { value: 'Fuar', label: 'Fuar' },
          { value: 'Ziyaret', label: 'Ziyaret' },
          { value: 'Tedavi', label: 'Tedavi' },
        ];
      case 'uk':
        return UK_VISA_TYPES.map((t) => ({ value: t, label: t }));
      case 'usa':
        return [
          { value: 'B1/B2', label: 'B1/B2 Turist/İş' },
          { value: 'F1', label: 'F1 Öğrenci' },
          { value: 'H1B', label: 'H1B Çalışma' },
        ];
      case 'russia':
        return RUSSIA_VISA_TYPES.map((t) => ({ value: t, label: t }));
      case 'uae':
        return UAE_VISA_TYPES.map((t) => ({ value: t, label: t }));
      default:
        return [];
    }
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    
    setValue('customerId', customerId);
    if (customer) {
      setValue('customerName', customer.name);
      setValue('passportNo', customer.passportNo || '');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setValue('category', category);
    setValue('country', '');
    setValue('visaType', '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.customerId) {
      setFieldError('customerId', 'Müşteri seçimi zorunlu');
      return;
    }
    if (!values.country) {
      setFieldError('country', 'Ülke seçimi zorunlu');
      return;
    }

    await onSave({
      ...values,
      category: selectedCategory,
    });
  };

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));
  const statusOptions = VISA_STATUSES.map((s) => ({ value: s, label: s }));
  const firmOptions = DEFAULT_FIRMS.map((f) => ({ value: f, label: f }));

  return (
    <form onSubmit={handleSubmit}>
      {/* Kategori Seçimi */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px', display: 'block' }}>
          Vize Kategorisi
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(VISA_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryChange(key)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: selectedCategory === key ? `2px solid ${cat.color}` : '1px solid #e5e7eb',
                backgroundColor: selectedCategory === key ? cat.color + '10' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{cat.icon}</span>
              <span style={{ fontWeight: selectedCategory === key ? '600' : '500' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Müşteri ve Ülke */}
      <FormRow columns={2}>
        <Select
          label="Müşteri"
          value={values.customerId}
          onChange={handleCustomerSelect}
          options={customerOptions}
          error={errors.customerId}
          required
          placeholder="Müşteri seçin..."
        />
        <Select
          label="Ülke"
          name="country"
          value={values.country}
          onChange={handleChange}
          options={getCountryOptions()}
          error={errors.country}
          required
        />
      </FormRow>

      {/* Vize Tipi ve Durum */}
      <FormRow columns={3}>
        <Select
          label="Vize Tipi"
          name="visaType"
          value={values.visaType}
          onChange={handleChange}
          options={getVisaTypeOptions()}
        />
        <Select
          label="Giriş Tipi"
          name="entryType"
          value={values.entryType}
          onChange={handleChange}
          options={[
            { value: 'Tek Giriş', label: 'Tek Giriş' },
            { value: 'Çift Giriş', label: 'Çift Giriş' },
            { value: 'Çoklu Giriş', label: 'Çoklu Giriş' },
          ]}
        />
        <Select
          label="Durum"
          name="status"
          value={values.status}
          onChange={handleChange}
          options={statusOptions}
        />
      </FormRow>

      {/* Randevu Bilgileri */}
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
          Randevu Bilgileri
        </h4>
        <FormRow columns={3}>
          <Input
            label="Randevu Tarihi"
            name="appointmentDate"
            type="date"
            value={values.appointmentDate}
            onChange={handleChange}
          />
          <Input
            label="Randevu Saati"
            name="appointmentTime"
            type="time"
            value={values.appointmentTime}
            onChange={handleChange}
          />
          <Input
            label="Randevu Yeri"
            name="appointmentLocation"
            value={values.appointmentLocation}
            onChange={handleChange}
            placeholder="Konsolosluk, VFS..."
          />
        </FormRow>
      </div>

      {/* Ücret Bilgileri */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
          Ücret Bilgileri
        </h4>
        <FormRow columns={4}>
          <Input
            label="Ücret"
            name="price"
            type="number"
            value={values.price}
            onChange={handleChange}
          />
          <Select
            label="Para Birimi"
            name="currency"
            value={values.currency}
            onChange={handleChange}
            options={[
              { value: 'EUR', label: '€ EUR' },
              { value: 'USD', label: '$ USD' },
              { value: 'TRY', label: '₺ TRY' },
              { value: 'GBP', label: '£ GBP' },
            ]}
          />
          <Input
            label="Ödenen"
            name="paidAmount"
            type="number"
            value={values.paidAmount}
            onChange={handleChange}
          />
          <Select
            label="Firma"
            name="firm"
            value={values.firm}
            onChange={handleChange}
            options={firmOptions}
          />
        </FormRow>
      </div>

      {/* Takip Bilgileri */}
      <FormRow columns={2}>
        <Input
          label="Takip No"
          name="trackingNo"
          value={values.trackingNo}
          onChange={handleChange}
        />
        <Input
          label="Dosya No"
          name="fileNo"
          value={values.fileNo}
          onChange={handleChange}
        />
      </FormRow>

      {/* Notlar */}
      <Textarea
        label="Notlar"
        name="notes"
        value={values.notes}
        onChange={handleChange}
        rows={3}
      />

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>İptal</Button>
        <Button type="submit" loading={loading}>{isEditing ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );
}

// ============================================================
// VISA PAGE (Main Container)
// ============================================================
export function VisaPage() {
  const [visas, setVisas] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  
  const formModal = useModal();
  const toast = useToast();
  const { execute, loading: actionLoading } = useAsync();

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [visaResult, customerResult] = await Promise.all([
        visaService.fetchAll(),
        customerService.fetchAll(),
      ]);
      
      if (visaResult.error) throw new Error(visaResult.error.message);
      if (customerResult.error) throw new Error(customerResult.error.message);
      
      setVisas(visaResult.data || []);
      setCustomers(customerResult.data || []);
    } catch (err) {
      toast.error('Veri yüklenirken hata: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter visas by category
  const filteredVisas = useMemo(() => {
    if (activeCategory === 'all') return visas;
    return visas.filter((v) => v.category === activeCategory);
  }, [visas, activeCategory]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts = { all: visas.length };
    Object.keys(VISA_CATEGORIES).forEach((key) => {
      counts[key] = visas.filter((v) => v.category === key).length;
    });
    return counts;
  }, [visas]);

  // Handlers
  const handleNewVisa = () => formModal.open(null);
  const handleEditVisa = (visa) => formModal.open(visa);

  const handleSaveVisa = async (visaData) => {
    const isEditing = !!formModal.data;
    
    const result = await execute(async () => {
      if (isEditing) {
        return visaService.update({ ...visaData, id: formModal.data.id });
      } else {
        return visaService.create(visaData);
      }
    });

    if (result.success) {
      toast.success(isEditing ? 'Vize güncellendi' : 'Vize eklendi');
      formModal.close();
      loadData();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  const handleDeleteVisa = async (id) => {
    const result = await execute(() => visaService.delete(id));
    if (result.success) {
      toast.success('Vize silindi');
      loadData();
    } else {
      toast.error('Silme hatası: ' + result.error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>Vize Başvuruları</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Vize başvurularını yönetin ve takip edin</p>
        </div>
        <Button onClick={handleNewVisa}>+ Yeni Başvuru</Button>
      </div>

      {/* Stats */}
      <VisaStatsCards visas={visas} />

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <VisaCategoriesSidebar
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={categoryCounts}
        />

        {/* List */}
        <div style={{ flex: 1 }}>
          <VisaList
            visas={filteredVisas}
            loading={loading}
            onSelect={(v) => handleEditVisa(v)}
            onEdit={handleEditVisa}
            onDelete={handleDeleteVisa}
          />
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={formModal.data ? 'Vize Düzenle' : 'Yeni Vize Başvurusu'}
        size="lg"
      >
        <VisaForm
          visa={formModal.data}
          customers={customers}
          onSave={handleSaveVisa}
          onCancel={formModal.close}
          loading={actionLoading}
        />
      </Modal>

      {/* Toasts */}
      {toast.toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => toast.removeToast(t.id)} />
      ))}
    </div>
  );
}

// Add missing Toast import
import { Toast } from '../../components/ui';

export default VisaPage;
