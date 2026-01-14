/**
 * Paydos CRM - Tours Feature Module
 * 
 * Tur yönetimi: Liste, Form, Katılımcılar, Maliyet hesaplama
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
  Toast,
} from '../../components/ui';
import { useForm, useSearch, useModal, useToast, useAsync, useConfirm } from '../../hooks';
import { tourService, customerService } from '../../services/supabase';
import {
  TOUR_STATUSES,
  CURRENCIES,
} from '../../utils/constants';
import {
  formatDate,
  formatCurrency,
  calculateDaysBetween,
  safeParseNumber,
} from '../../utils/helpers';

// ============================================================
// TOUR STATS CARDS
// ============================================================
export function TourStatsCards({ tours }) {
  const stats = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let completed = 0;
    let totalParticipants = 0;
    let totalRevenue = 0;

    const today = new Date().toISOString().split('T')[0];

    tours.forEach((tour) => {
      if (tour.status === 'Tamamlandı') {
        completed++;
      } else if (tour.startDate > today) {
        upcoming++;
      } else if (tour.status === 'Devam Ediyor' || (tour.startDate <= today && tour.endDate >= today)) {
        active++;
      }
      
      totalParticipants += (tour.participants || []).length;
      totalRevenue += safeParseNumber(tour.totalPrice) || 0;
    });

    return { total: tours.length, active, upcoming, completed, totalParticipants, totalRevenue };
  }, [tours]);

  const statCards = [
    { label: 'Toplam Tur', value: stats.total, icon: '✈️', color: '#3b82f6' },
    { label: 'Aktif', value: stats.active, icon: '🔥', color: '#22c55e' },
    { label: 'Yaklaşan', value: stats.upcoming, icon: '📅', color: '#8b5cf6' },
    { label: 'Tamamlanan', value: stats.completed, icon: '✅', color: '#6b7280' },
    { label: 'Katılımcı', value: stats.totalParticipants, icon: '👥', color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {statCards.map((card, idx) => (
        <Card key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{card.label}</div>
            </div>
            <span style={{ fontSize: '24px' }}>{card.icon}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// TOUR LIST COMPONENT
// ============================================================
export function TourList({
  tours = [],
  loading = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  const { query, setQuery, filteredItems } = useSearch(tours, ['name', 'destination', 'fairName']);
  const confirm = useConfirm();

  const columns = [
    {
      key: 'name',
      header: 'Tur Adı',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.fairName || row.destination}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Tarih',
      render: (row) => {
        const duration = calculateDaysBetween(row.startDate, row.endDate);
        return (
          <div>
            <div>{formatDate(row.startDate)} - {formatDate(row.endDate)}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{duration} gece</div>
          </div>
        );
      },
    },
    {
      key: 'participants',
      header: 'Katılımcı',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>👥</span>
          <span>{(row.participants || []).length} / {row.quota || '∞'}</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Fiyat',
      render: (row) => (
        <div style={{ fontWeight: '500' }}>
          {formatCurrency(row.pricePerPerson, row.currency)}
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}> /kişi</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => <StatusBadge status={row.status} type="tour" />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <DropdownMenu
          trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '18px' }}>⋮</button>}
          items={[
            { label: 'Düzenle', icon: '✏️', onClick: () => onEdit(row) },
            { label: 'Katılımcılar', icon: '👥', onClick: () => onSelect(row) },
            { divider: true },
            { label: 'Sil', icon: '🗑️', danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ];

  const handleDelete = (tour) => {
    confirm.confirm({
      title: 'Turu Sil',
      message: `"${tour.name}" turunu silmek istediğinize emin misiniz?`,
      onConfirm: () => onDelete(tour.id),
    });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Tur ara..." style={{ maxWidth: '400px' }} />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState icon="✈️" title="Tur bulunamadı" description={query ? 'Arama kriterlerine uygun tur yok' : 'Henüz tur eklenmemiş'} />
      ) : (
        <Card padding={false}>
          <Table columns={columns} data={filteredItems} onRowClick={onSelect} />
        </Card>
      )}

      <ConfirmDialog isOpen={confirm.isOpen} onClose={confirm.close} onConfirm={confirm.handleConfirm} title={confirm.title} message={confirm.message} />
    </div>
  );
}

// ============================================================
// TOUR FORM COMPONENT
// ============================================================
export function TourForm({
  tour = null,
  onSave,
  onCancel,
  loading = false,
}) {
  const isEditing = !!tour;
  
  const initialValues = tour || {
    name: '',
    fairName: '',
    destination: '',
    startDate: '',
    endDate: '',
    status: 'Planlama',
    quota: '',
    pricePerPerson: '',
    currency: 'EUR',
    hotelName: '',
    hotelStars: '',
    boardType: '',
    flightInfo: '',
    description: '',
    notes: '',
    includedServices: '',
    excludedServices: '',
  };

  const { values, handleChange, errors, setFieldError } = useForm(initialValues);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.name?.trim()) {
      setFieldError('name', 'Tur adı zorunlu');
      return;
    }
    if (!values.startDate || !values.endDate) {
      setFieldError('startDate', 'Tarihler zorunlu');
      return;
    }

    await onSave(values);
  };

  const statusOptions = TOUR_STATUSES.map((s) => ({ value: s, label: s }));
  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <form onSubmit={handleSubmit}>
      {/* Temel Bilgiler */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Tur Bilgileri</h4>
        
        <FormRow columns={2}>
          <Input label="Tur Adı" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
          <Input label="Fuar Adı" name="fairName" value={values.fairName} onChange={handleChange} placeholder="(Fuar turu ise)" />
        </FormRow>

        <FormRow columns={3}>
          <Input label="Destinasyon" name="destination" value={values.destination} onChange={handleChange} />
          <Input label="Başlangıç" name="startDate" type="date" value={values.startDate} onChange={handleChange} error={errors.startDate} required />
          <Input label="Bitiş" name="endDate" type="date" value={values.endDate} onChange={handleChange} required />
        </FormRow>

        <FormRow columns={3}>
          <Select label="Durum" name="status" value={values.status} onChange={handleChange} options={statusOptions} />
          <Input label="Kontenjan" name="quota" type="number" value={values.quota} onChange={handleChange} placeholder="Boş = sınırsız" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input label="Kişi Başı Fiyat" name="pricePerPerson" type="number" value={values.pricePerPerson} onChange={handleChange} style={{ flex: 2 }} />
            <Select label="Birim" name="currency" value={values.currency} onChange={handleChange} options={currencyOptions} style={{ flex: 1 }} />
          </div>
        </FormRow>
      </div>

      {/* Konaklama */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Konaklama</h4>
        
        <FormRow columns={3}>
          <Input label="Otel Adı" name="hotelName" value={values.hotelName} onChange={handleChange} />
          <Select
            label="Yıldız"
            name="hotelStars"
            value={values.hotelStars}
            onChange={handleChange}
            options={[
              { value: '3', label: '⭐⭐⭐ 3 Yıldız' },
              { value: '4', label: '⭐⭐⭐⭐ 4 Yıldız' },
              { value: '5', label: '⭐⭐⭐⭐⭐ 5 Yıldız' },
            ]}
          />
          <Select
            label="Pansiyon"
            name="boardType"
            value={values.boardType}
            onChange={handleChange}
            options={[
              { value: 'BB', label: 'BB - Oda Kahvaltı' },
              { value: 'HB', label: 'HB - Yarım Pansiyon' },
              { value: 'FB', label: 'FB - Tam Pansiyon' },
              { value: 'AI', label: 'AI - Her Şey Dahil' },
            ]}
          />
        </FormRow>
      </div>

      {/* Uçuş */}
      <div style={{ marginBottom: '24px' }}>
        <Textarea label="Uçuş Bilgileri" name="flightInfo" value={values.flightInfo} onChange={handleChange} rows={2} placeholder="THY İstanbul - Berlin 10:00..." />
      </div>

      {/* Dahil/Hariç */}
      <FormRow columns={2}>
        <Textarea label="Dahil Olan Hizmetler" name="includedServices" value={values.includedServices} onChange={handleChange} rows={3} placeholder="- Uçak bileti&#10;- Otel konaklaması&#10;- Transferler" />
        <Textarea label="Hariç Olan Hizmetler" name="excludedServices" value={values.excludedServices} onChange={handleChange} rows={3} placeholder="- Vize ücreti&#10;- Kişisel harcamalar" />
      </FormRow>

      {/* Açıklama */}
      <Textarea label="Açıklama" name="description" value={values.description} onChange={handleChange} rows={2} />
      <Textarea label="Notlar" name="notes" value={values.notes} onChange={handleChange} rows={2} />

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>İptal</Button>
        <Button type="submit" loading={loading}>{isEditing ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );
}

// ============================================================
// TOUR PARTICIPANTS COMPONENT
// ============================================================
export function TourParticipants({
  tour,
  allCustomers = [],
  onAddParticipant,
  onRemoveParticipant,
  onUpdatePayment,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const confirm = useConfirm();

  const participants = tour?.participants || [];

  // Customers not yet in this tour
  const availableCustomers = allCustomers.filter(
    (c) => !participants.find((p) => p.customerId === c.id)
  );

  const handleAdd = () => {
    if (selectedCustomerId) {
      const customer = allCustomers.find((c) => c.id === selectedCustomerId);
      onAddParticipant({
        customerId: selectedCustomerId,
        customerName: customer?.name,
        paidAmount: 0,
        paymentStatus: 'Ödenmedi',
        roomType: 'Tek',
        notes: '',
      });
      setSelectedCustomerId('');
      setShowAddModal(false);
    }
  };

  const handleRemove = (participant) => {
    confirm.confirm({
      title: 'Katılımcıyı Çıkar',
      message: `${participant.customerName} turdan çıkarılsın mı?`,
      onConfirm: () => onRemoveParticipant(participant.customerId),
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Katılımcılar</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {participants.length} / {tour?.quota || '∞'} kişi
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>+ Katılımcı Ekle</Button>
      </div>

      {/* List */}
      {participants.length === 0 ? (
        <EmptyState icon="👥" title="Katılımcı yok" description="Henüz bu tura katılımcı eklenmemiş" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {participants.map((p, idx) => (
            <Card key={idx} padding={false}>
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{p.customerName}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {p.roomType} Kişilik Oda • {p.paymentStatus}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant={p.paymentStatus === 'Ödendi' ? 'success' : p.paidAmount > 0 ? 'warning' : 'default'}>
                    {formatCurrency(p.paidAmount, tour?.currency)} / {formatCurrency(tour?.pricePerPerson, tour?.currency)}
                  </Badge>
                  <button onClick={() => handleRemove(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    ✕
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Katılımcı Ekle" size="sm">
        <Select
          label="Müşteri Seç"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          options={availableCustomers.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Müşteri seçin..."
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>İptal</Button>
          <Button onClick={handleAdd} disabled={!selectedCustomerId}>Ekle</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirm.isOpen} onClose={confirm.close} onConfirm={confirm.handleConfirm} title={confirm.title} message={confirm.message} />
    </div>
  );
}

// ============================================================
// TOURS PAGE (Main Container)
// ============================================================
export function ToursPage() {
  const [tours, setTours] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  
  const formModal = useModal();
  const participantsModal = useModal();
  const toast = useToast();
  const { execute, loading: actionLoading } = useAsync();

  const loadData = async () => {
    setLoading(true);
    try {
      const [tourResult, customerResult] = await Promise.all([
        tourService.fetchAll(),
        customerService.fetchAll(),
      ]);
      
      if (tourResult.error) throw new Error(tourResult.error.message);
      if (customerResult.error) throw new Error(customerResult.error.message);
      
      setTours(tourResult.data || []);
      setCustomers(customerResult.data || []);
    } catch (err) {
      toast.error('Veri yüklenirken hata: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewTour = () => formModal.open(null);
  const handleEditTour = (tour) => formModal.open(tour);
  const handleSelectTour = (tour) => {
    setSelectedTour(tour);
    participantsModal.open(tour);
  };

  const handleSaveTour = async (tourData) => {
    const isEditing = !!formModal.data;
    
    const result = await execute(async () => {
      if (isEditing) {
        return tourService.update({ ...tourData, id: formModal.data.id });
      } else {
        return tourService.create({ ...tourData, participants: [] });
      }
    });

    if (result.success) {
      toast.success(isEditing ? 'Tur güncellendi' : 'Tur eklendi');
      formModal.close();
      loadData();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  const handleDeleteTour = async (id) => {
    const result = await execute(() => tourService.delete(id));
    if (result.success) {
      toast.success('Tur silindi');
      loadData();
    } else {
      toast.error('Silme hatası: ' + result.error);
    }
  };

  const handleAddParticipant = async (participant) => {
    if (!selectedTour) return;
    
    const updatedParticipants = [...(selectedTour.participants || []), participant];
    const result = await execute(() => 
      tourService.update({ id: selectedTour.id, participants: updatedParticipants })
    );

    if (result.success) {
      toast.success('Katılımcı eklendi');
      setSelectedTour({ ...selectedTour, participants: updatedParticipants });
      loadData();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  const handleRemoveParticipant = async (customerId) => {
    if (!selectedTour) return;
    
    const updatedParticipants = (selectedTour.participants || []).filter(
      (p) => p.customerId !== customerId
    );
    const result = await execute(() => 
      tourService.update({ id: selectedTour.id, participants: updatedParticipants })
    );

    if (result.success) {
      toast.success('Katılımcı çıkarıldı');
      setSelectedTour({ ...selectedTour, participants: updatedParticipants });
      loadData();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>Turlar</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Fuar ve grup turlarını yönetin</p>
        </div>
        <Button onClick={handleNewTour}>+ Yeni Tur</Button>
      </div>

      {/* Stats */}
      <TourStatsCards tours={tours} />

      {/* List */}
      <TourList
        tours={tours}
        loading={loading}
        onSelect={handleSelectTour}
        onEdit={handleEditTour}
        onDelete={handleDeleteTour}
      />

      {/* Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Tur Düzenle' : 'Yeni Tur'} size="lg">
        <TourForm tour={formModal.data} onSave={handleSaveTour} onCancel={formModal.close} loading={actionLoading} />
      </Modal>

      {/* Participants Modal */}
      <Modal isOpen={participantsModal.isOpen} onClose={participantsModal.close} title={selectedTour?.name || 'Katılımcılar'} size="lg">
        <TourParticipants
          tour={selectedTour}
          allCustomers={customers}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      </Modal>

      {/* Toasts */}
      {toast.toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => toast.removeToast(t.id)} />
      ))}
    </div>
  );
}

export default ToursPage;
