/**
 * Paydos CRM - Customers Feature Module
 * 
 * Müşteri yönetimi: Liste, Form, Detay görünümleri
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
import { customerService } from '../../services/supabase';
import {
  TURKISH_PROVINCES,
  PURPOSE_TYPES,
  SECTORS,
  DEFAULT_TAGS,
  DEFAULT_FIRMS,
} from '../../utils/constants';
import {
  formatDate,
  isValidEmail,
  isValidTcKimlik,
  formatPhoneForWhatsApp,
  createWhatsAppLink,
  isPassportExpiringSoon,
  generateUniqueId,
} from '../../utils/helpers';

// ============================================================
// CUSTOMER LIST COMPONENT
// ============================================================
export function CustomerList({
  customers = [],
  loading = false,
  onSelect,
  onEdit,
  onDelete,
  onBulkDelete,
  onRefresh,
}) {
  const [viewMode, setViewMode] = useState('table'); // table | cards
  const { query, setQuery, filteredItems } = useSearch(customers, ['name', 'tcKimlik', 'phone', 'email', 'company']);
  const { paginatedItems, currentPage, totalPages, goToPage, totalItems } = usePagination(filteredItems, 25);
  const selection = useSelection(filteredItems);
  const confirm = useConfirm();

  const columns = [
    {
      key: 'name',
      header: 'Müşteri',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500', color: '#111827' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.company || '-'}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'İletişim',
      render: (row) => (
        <div style={{ fontSize: '13px' }}>
          <div>{row.phone || '-'}</div>
          <div style={{ color: '#6b7280' }}>{row.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'tcKimlik',
      header: 'TC Kimlik',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {row.tcKimlik || '-'}
        </span>
      ),
    },
    {
      key: 'passport',
      header: 'Pasaport',
      render: (row) => {
        const expiring = row.passportExpiry && isPassportExpiringSoon(row.passportExpiry);
        return (
          <div>
            <div style={{ fontSize: '13px' }}>{row.passportNo || '-'}</div>
            {row.passportExpiry && (
              <div style={{ 
                fontSize: '12px', 
                color: expiring ? '#dc2626' : '#6b7280',
                fontWeight: expiring ? '500' : 'normal',
              }}>
                {formatDate(row.passportExpiry)}
                {expiring && ' ⚠️'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'tags',
      header: 'Etiketler',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(row.tags || []).slice(0, 3).map((tag, idx) => (
            <Badge key={idx} size="sm" variant="info">{tag}</Badge>
          ))}
          {(row.tags || []).length > 3 && (
            <Badge size="sm">+{row.tags.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <DropdownMenu
          trigger={
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              fontSize: '18px',
            }}>⋮</button>
          }
          items={[
            { label: 'Düzenle', icon: '✏️', onClick: () => onEdit(row) },
            { label: 'WhatsApp', icon: '💬', onClick: () => window.open(createWhatsAppLink(row.phone), '_blank') },
            { divider: true },
            { label: 'Sil', icon: '🗑️', danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ];

  const handleDelete = (customer) => {
    confirm.confirm({
      title: 'Müşteriyi Sil',
      message: `"${customer.name}" müşterisini silmek istediğinize emin misiniz?`,
      onConfirm: () => onDelete(customer.id),
    });
  };

  const handleBulkDelete = () => {
    confirm.confirm({
      title: 'Toplu Silme',
      message: `${selection.selectedCount} müşteriyi silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        onBulkDelete(selection.selectedIds);
        selection.deselectAll();
      },
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Müşteri ara..."
            style={{ width: '300px' }}
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {totalItems} müşteri
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {selection.hasSelection && (
            <>
              <Button variant="secondary" size="sm" onClick={selection.deselectAll}>
                {selection.selectedCount} seçili - İptal
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                🗑️ Sil
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            🔄
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Müşteri bulunamadı"
          description={query ? 'Arama kriterlerine uygun müşteri yok' : 'Henüz müşteri eklenmemiş'}
        />
      ) : (
        <>
          <Card padding={false}>
            <Table
              columns={columns}
              data={paginatedItems}
              onRowClick={onSelect}
              selectedIds={selection.selectedIds}
              onSelect={selection.setSelectedIds}
            />
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px',
            }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </Button>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
      />
    </div>
  );
}

// ============================================================
// CUSTOMER FORM COMPONENT
// ============================================================
export function CustomerForm({
  customer = null, // null = new, object = edit
  onSave,
  onCancel,
  loading = false,
}) {
  const isEditing = !!customer;
  
  const initialValues = customer || {
    name: '',
    tcKimlik: '',
    phone: '',
    email: '',
    company: '',
    position: '',
    sector: '',
    city: '',
    address: '',
    passportNo: '',
    passportExpiry: '',
    birthDate: '',
    birthPlace: '',
    fatherName: '',
    motherName: '',
    purpose: '',
    firm: '',
    notes: '',
    tags: [],
  };

  const { values, handleChange, setValue, errors, setFieldError, reset } = useForm(initialValues);
  const [selectedTags, setSelectedTags] = useState(customer?.tags || []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!values.name?.trim()) {
      newErrors.name = 'Ad Soyad zorunlu';
    }
    
    if (values.tcKimlik && !isValidTcKimlik(values.tcKimlik)) {
      newErrors.tcKimlik = 'Geçersiz TC Kimlik numarası';
    }
    
    if (values.email && !isValidEmail(values.email)) {
      newErrors.email = 'Geçersiz e-posta adresi';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, error]) => {
        setFieldError(field, error);
      });
      return;
    }

    const customerData = {
      ...values,
      tags: selectedTags,
    };

    await onSave(customerData);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const provinceOptions = TURKISH_PROVINCES.map((p) => ({ value: p, label: p }));
  const sectorOptions = SECTORS.map((s) => ({ value: s, label: s }));
  const purposeOptions = PURPOSE_TYPES.map((p) => ({ value: p, label: p }));
  const firmOptions = DEFAULT_FIRMS.map((f) => ({ value: f, label: f }));

  return (
    <form onSubmit={handleSubmit}>
      {/* Temel Bilgiler */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
          Temel Bilgiler
        </h4>
        
        <FormRow columns={2}>
          <Input
            label="Ad Soyad"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="TC Kimlik No"
            name="tcKimlik"
            value={values.tcKimlik}
            onChange={handleChange}
            error={errors.tcKimlik}
            maxLength={11}
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="Telefon"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            placeholder="+90 5XX XXX XXXX"
          />
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="Firma"
            name="company"
            value={values.company}
            onChange={handleChange}
          />
          <Input
            label="Pozisyon"
            name="position"
            value={values.position}
            onChange={handleChange}
          />
        </FormRow>

        <FormRow columns={2}>
          <Select
            label="Sektör"
            name="sector"
            value={values.sector}
            onChange={handleChange}
            options={sectorOptions}
          />
          <Select
            label="Şehir"
            name="city"
            value={values.city}
            onChange={handleChange}
            options={provinceOptions}
          />
        </FormRow>
      </div>

      {/* Pasaport Bilgileri */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
          Pasaport Bilgileri
        </h4>
        
        <FormRow columns={2}>
          <Input
            label="Pasaport No"
            name="passportNo"
            value={values.passportNo}
            onChange={handleChange}
          />
          <Input
            label="Pasaport Bitiş"
            name="passportExpiry"
            type="date"
            value={values.passportExpiry}
            onChange={handleChange}
          />
        </FormRow>

        <FormRow columns={3}>
          <Input
            label="Doğum Tarihi"
            name="birthDate"
            type="date"
            value={values.birthDate}
            onChange={handleChange}
          />
          <Input
            label="Doğum Yeri"
            name="birthPlace"
            value={values.birthPlace}
            onChange={handleChange}
          />
          <Select
            label="Amaç"
            name="purpose"
            value={values.purpose}
            onChange={handleChange}
            options={purposeOptions}
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="Baba Adı"
            name="fatherName"
            value={values.fatherName}
            onChange={handleChange}
          />
          <Input
            label="Anne Adı"
            name="motherName"
            value={values.motherName}
            onChange={handleChange}
          />
        </FormRow>
      </div>

      {/* Etiketler */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
          Etiketler
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DEFAULT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedTags.includes(tag) ? '#3b82f6' : '#f3f4f6',
                color: selectedTags.includes(tag) ? 'white' : '#374151',
                transition: 'all 0.2s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notlar */}
      <div style={{ marginBottom: '24px' }}>
        <Textarea
          label="Notlar"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Müşteri hakkında notlar..."
        />
      </div>

      {/* Adres */}
      <div style={{ marginBottom: '24px' }}>
        <Textarea
          label="Adres"
          name="address"
          value={values.address}
          onChange={handleChange}
          rows={2}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          İptal
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================
// CUSTOMER DETAIL COMPONENT
// ============================================================
export function CustomerDetail({
  customer,
  visaHistory = [],
  tourHistory = [],
  onEdit,
  onClose,
  onWhatsApp,
}) {
  const [activeTab, setActiveTab] = useState('info');

  if (!customer) return null;

  const tabs = [
    { key: 'info', label: 'Bilgiler', icon: '📋' },
    { key: 'visa', label: 'Vize Geçmişi', icon: '🛂', count: visaHistory.length },
    { key: 'tours', label: 'Tur Geçmişi', icon: '✈️', count: tourHistory.length },
    { key: 'activities', label: 'Aktiviteler', icon: '📝', count: customer.activities?.length || 0 },
  ];

  const passportExpiring = customer.passportExpiry && isPassportExpiringSoon(customer.passportExpiry);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>
            {customer.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {customer.company ? `${customer.position || ''} @ ${customer.company}` : customer.city || '-'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {customer.phone && (
            <Button variant="success" size="sm" onClick={() => onWhatsApp(customer)}>
              💬 WhatsApp
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onEdit(customer)}>
            ✏️ Düzenle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div style={{ paddingTop: '24px' }}>
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {/* İletişim */}
            <Card title="İletişim Bilgileri">
              <InfoRow label="Telefon" value={customer.phone} />
              <InfoRow label="E-posta" value={customer.email} />
              <InfoRow label="Şehir" value={customer.city} />
              <InfoRow label="Adres" value={customer.address} />
            </Card>

            {/* Kimlik */}
            <Card title="Kimlik Bilgileri">
              <InfoRow label="TC Kimlik" value={customer.tcKimlik} mono />
              <InfoRow label="Doğum Tarihi" value={formatDate(customer.birthDate)} />
              <InfoRow label="Doğum Yeri" value={customer.birthPlace} />
              <InfoRow label="Baba Adı" value={customer.fatherName} />
              <InfoRow label="Anne Adı" value={customer.motherName} />
            </Card>

            {/* Pasaport */}
            <Card title="Pasaport Bilgileri">
              <InfoRow label="Pasaport No" value={customer.passportNo} mono />
              <InfoRow 
                label="Geçerlilik" 
                value={formatDate(customer.passportExpiry)} 
                warning={passportExpiring}
                warningText="6 aydan az kaldı!"
              />
            </Card>

            {/* İş */}
            <Card title="İş Bilgileri">
              <InfoRow label="Firma" value={customer.company} />
              <InfoRow label="Pozisyon" value={customer.position} />
              <InfoRow label="Sektör" value={customer.sector} />
              <InfoRow label="Amaç" value={customer.purpose} />
            </Card>

            {/* Etiketler */}
            {customer.tags?.length > 0 && (
              <Card title="Etiketler" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {customer.tags.map((tag, idx) => (
                    <Badge key={idx} variant="info">{tag}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Notlar */}
            {customer.notes && (
              <Card title="Notlar" style={{ gridColumn: 'span 2' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#4b5563' }}>
                  {customer.notes}
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'visa' && (
          <div>
            {visaHistory.length === 0 ? (
              <EmptyState
                icon="🛂"
                title="Vize kaydı yok"
                description="Bu müşteri için henüz vize başvurusu yapılmamış"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visaHistory.map((visa) => (
                  <Card key={visa.id} padding={false}>
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{visa.country}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {visa.visaType} • {formatDate(visa.appointmentDate)}
                        </div>
                      </div>
                      <StatusBadge status={visa.status} type="visa" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tours' && (
          <div>
            {tourHistory.length === 0 ? (
              <EmptyState
                icon="✈️"
                title="Tur kaydı yok"
                description="Bu müşteri henüz bir tura katılmamış"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tourHistory.map((tour) => (
                  <Card key={tour.id} padding={false}>
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{tour.name}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
                        </div>
                      </div>
                      <StatusBadge status={tour.status} type="tour" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            {(!customer.activities || customer.activities.length === 0) ? (
              <EmptyState
                icon="📝"
                title="Aktivite yok"
                description="Bu müşteri için henüz aktivite kaydedilmemiş"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customer.activities.map((activity, idx) => (
                  <Card key={idx} padding={false}>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {formatDate(activity.date)} • {activity.type}
                      </div>
                      <div style={{ fontSize: '14px' }}>{activity.note}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INFO ROW HELPER
// ============================================================
function InfoRow({ label, value, mono = false, warning = false, warningText }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{label}</div>
      <div style={{
        fontSize: '14px',
        color: warning ? '#dc2626' : '#111827',
        fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: warning ? '500' : 'normal',
      }}>
        {value || '-'}
        {warning && warningText && (
          <span style={{ marginLeft: '8px', fontSize: '12px' }}>⚠️ {warningText}</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMERS PAGE (Main Container)
// ============================================================
export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const formModal = useModal();
  const detailModal = useModal();
  const toast = useToast();
  const { execute, loading: actionLoading } = useAsync();

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    const { data, error } = await customerService.fetchAll();
    if (error) {
      toast.error('Müşteriler yüklenirken hata: ' + error.message);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Handlers
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    detailModal.open(customer);
  };

  const handleEditCustomer = (customer) => {
    detailModal.close();
    formModal.open(customer);
  };

  const handleNewCustomer = () => {
    formModal.open(null);
  };

  const handleSaveCustomer = async (customerData) => {
    const isEditing = !!formModal.data;
    
    const result = await execute(async () => {
      if (isEditing) {
        return customerService.update({ ...customerData, id: formModal.data.id });
      } else {
        return customerService.create(customerData);
      }
    });

    if (result.success) {
      toast.success(isEditing ? 'Müşteri güncellendi' : 'Müşteri eklendi');
      formModal.close();
      loadCustomers();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    const result = await execute(() => customerService.delete(id));
    if (result.success) {
      toast.success('Müşteri silindi');
      detailModal.close();
      loadCustomers();
    } else {
      toast.error('Silme hatası: ' + result.error);
    }
  };

  const handleBulkDelete = async (ids) => {
    const result = await execute(() => customerService.bulkDelete(ids));
    if (result.success) {
      toast.success(`${ids.length} müşteri silindi`);
      loadCustomers();
    } else {
      toast.error('Silme hatası: ' + result.error);
    }
  };

  const handleWhatsApp = (customer) => {
    if (customer.phone) {
      window.open(createWhatsAppLink(customer.phone), '_blank');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>
            Müşteriler
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Müşteri veritabanınızı yönetin
          </p>
        </div>
        <Button onClick={handleNewCustomer}>
          + Yeni Müşteri
        </Button>
      </div>

      {/* Customer List */}
      <CustomerList
        customers={customers}
        loading={loading}
        onSelect={handleSelectCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onBulkDelete={handleBulkDelete}
        onRefresh={loadCustomers}
      />

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={formModal.data ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
        size="lg"
      >
        <CustomerForm
          customer={formModal.data}
          onSave={handleSaveCustomer}
          onCancel={formModal.close}
          loading={actionLoading}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        title="Müşteri Detayı"
        size="xl"
      >
        <CustomerDetail
          customer={detailModal.data}
          visaHistory={[]} // TODO: load from visa service
          tourHistory={[]} // TODO: load from tour service
          onEdit={handleEditCustomer}
          onClose={detailModal.close}
          onWhatsApp={handleWhatsApp}
        />
      </Modal>

      {/* Toast notifications */}
      {toast.toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => toast.removeToast(t.id)}
        />
      ))}
    </div>
  );
}

export default CustomersPage;
