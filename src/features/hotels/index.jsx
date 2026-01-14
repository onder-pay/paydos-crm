/**
 * Paydos CRM - Hotels Feature Module
 * 
 * Otel rezervasyon yönetimi
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
  Toast,
} from '../../components/ui';
import { useForm, useSearch, usePagination, useModal, useToast, useAsync, useConfirm } from '../../hooks';
import { hotelService, customerService } from '../../services/supabase';
import {
  HOTEL_STATUSES,
  ROOM_TYPES,
  BOARD_TYPES,
  CURRENCIES,
} from '../../utils/constants';
import {
  formatDate,
  formatCurrency,
  calculateNights,
  calculateCommission,
  safeParseNumber,
} from '../../utils/helpers';

// ============================================================
// HOTEL STATS CARDS
// ============================================================
export function HotelStatsCards({ reservations }) {
  const stats = useMemo(() => {
    const byStatus = {};
    HOTEL_STATUSES.forEach((s) => { byStatus[s] = 0; });
    
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalNights = 0;

    reservations.forEach((r) => {
      if (byStatus[r.status] !== undefined) {
        byStatus[r.status]++;
      }
      totalRevenue += safeParseNumber(r.totalPrice) || 0;
      totalCommission += calculateCommission(r.totalPrice, r);
      totalNights += calculateNights(r.checkIn, r.checkOut) || 0;
    });

    return {
      total: reservations.length,
      byStatus,
      totalRevenue,
      totalCommission,
      totalNights,
    };
  }, [reservations]);

  const statCards = [
    { label: 'Toplam', value: stats.total, icon: '🏨', color: '#3b82f6' },
    { label: 'Beklemede', value: stats.byStatus['Beklemede'], icon: '⏳', color: '#f59e0b' },
    { label: 'Onaylandı', value: stats.byStatus['Onaylandı'], icon: '✅', color: '#22c55e' },
    { label: 'Toplam Gece', value: stats.totalNights, icon: '🌙', color: '#8b5cf6' },
    { label: 'Komisyon', value: formatCurrency(stats.totalCommission, 'EUR'), icon: '💰', color: '#10b981', isText: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {statCards.map((card, idx) => (
        <Card key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: card.isText ? '20px' : '28px', fontWeight: '600', color: card.color }}>
                {card.value}
              </div>
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
// HOTEL LIST COMPONENT
// ============================================================
export function HotelList({
  reservations = [],
  loading = false,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { query, setQuery, filteredItems } = useSearch(reservations, ['guestName', 'hotelName', 'city']);
  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(filteredItems, 25);
  const confirm = useConfirm();

  const columns = [
    {
      key: 'guest',
      header: 'Misafir',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.guestName}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.guestPhone || '-'}</div>
        </div>
      ),
    },
    {
      key: 'hotel',
      header: 'Otel',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.hotelName}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.city}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Tarih',
      render: (row) => {
        const nights = calculateNights(row.checkIn, row.checkOut);
        return (
          <div>
            <div>{formatDate(row.checkIn)} → {formatDate(row.checkOut)}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{nights} gece</div>
          </div>
        );
      },
    },
    {
      key: 'room',
      header: 'Oda',
      render: (row) => (
        <div>
          <div>{row.roomType}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.boardType} • {row.roomCount || 1} oda</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Tutar',
      render: (row) => {
        const commission = calculateCommission(row.totalPrice, row);
        return (
          <div>
            <div style={{ fontWeight: '500' }}>{formatCurrency(row.totalPrice, row.currency)}</div>
            <div style={{ fontSize: '12px', color: '#22c55e' }}>
              Kom: {formatCurrency(commission, row.currency)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => <StatusBadge status={row.status} type="hotel" />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <DropdownMenu
          trigger={<button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '18px' }}>⋮</button>}
          items={[
            { label: 'Düzenle', icon: '✏️', onClick: () => onEdit(row) },
            { label: 'Onayla', icon: '✅', onClick: () => onStatusChange(row.id, 'Onaylandı') },
            { divider: true },
            { label: 'Sil', icon: '🗑️', danger: true, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ];

  const handleDelete = (reservation) => {
    confirm.confirm({
      title: 'Rezervasyonu Sil',
      message: `${reservation.guestName} - ${reservation.hotelName} rezervasyonunu silmek istediğinize emin misiniz?`,
      onConfirm: () => onDelete(reservation.id),
    });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Misafir, otel veya şehir ara..." style={{ maxWidth: '400px' }} />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState icon="🏨" title="Rezervasyon bulunamadı" description={query ? 'Arama kriterlerine uygun rezervasyon yok' : 'Henüz rezervasyon eklenmemiş'} />
      ) : (
        <>
          <Card padding={false}>
            <Table columns={columns} data={paginatedItems} onRowClick={onSelect} />
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

      <ConfirmDialog isOpen={confirm.isOpen} onClose={confirm.close} onConfirm={confirm.handleConfirm} title={confirm.title} message={confirm.message} />
    </div>
  );
}

// ============================================================
// HOTEL FORM COMPONENT
// ============================================================
export function HotelForm({
  reservation = null,
  customers = [],
  onSave,
  onCancel,
  loading = false,
}) {
  const isEditing = !!reservation;
  
  const initialValues = reservation || {
    customerId: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    hotelName: '',
    hotelStars: '',
    city: '',
    country: '',
    checkIn: '',
    checkOut: '',
    roomType: 'Standart',
    roomCount: 1,
    boardType: 'BB',
    adults: 2,
    children: 0,
    pricePerNight: '',
    totalPrice: '',
    currency: 'EUR',
    commissionType: 'percent',
    commissionValue: '10',
    status: 'Beklemede',
    confirmationNo: '',
    supplierName: '',
    supplierContact: '',
    notes: '',
    specialRequests: '',
  };

  const { values, handleChange, setValue, errors, setFieldError } = useForm(initialValues);

  // Auto-calculate total price
  useEffect(() => {
    const nights = calculateNights(values.checkIn, values.checkOut);
    const pricePerNight = safeParseNumber(values.pricePerNight);
    const roomCount = safeParseNumber(values.roomCount) || 1;
    
    if (nights > 0 && pricePerNight > 0) {
      const total = nights * pricePerNight * roomCount;
      setValue('totalPrice', total.toString());
    }
  }, [values.checkIn, values.checkOut, values.pricePerNight, values.roomCount]);

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    
    setValue('customerId', customerId);
    if (customer) {
      setValue('guestName', customer.name);
      setValue('guestPhone', customer.phone || '');
      setValue('guestEmail', customer.email || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!values.guestName?.trim()) {
      setFieldError('guestName', 'Misafir adı zorunlu');
      return;
    }
    if (!values.hotelName?.trim()) {
      setFieldError('hotelName', 'Otel adı zorunlu');
      return;
    }
    if (!values.checkIn || !values.checkOut) {
      setFieldError('checkIn', 'Tarihler zorunlu');
      return;
    }

    await onSave(values);
  };

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));
  const statusOptions = HOTEL_STATUSES.map((s) => ({ value: s, label: s }));
  const roomTypeOptions = ROOM_TYPES.map((r) => ({ value: r, label: r }));
  const boardTypeOptions = BOARD_TYPES.map((b) => ({ value: b.code, label: `${b.code} - ${b.name}` }));
  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));

  const nights = calculateNights(values.checkIn, values.checkOut);
  const commission = calculateCommission(values.totalPrice, values);

  return (
    <form onSubmit={handleSubmit}>
      {/* Misafir Bilgileri */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Misafir Bilgileri</h4>
        
        <FormRow columns={2}>
          <Select
            label="Müşteriden Seç"
            value={values.customerId}
            onChange={handleCustomerSelect}
            options={customerOptions}
            placeholder="(Opsiyonel)"
          />
          <Input
            label="Misafir Adı"
            name="guestName"
            value={values.guestName}
            onChange={handleChange}
            error={errors.guestName}
            required
          />
        </FormRow>

        <FormRow columns={2}>
          <Input label="Telefon" name="guestPhone" value={values.guestPhone} onChange={handleChange} />
          <Input label="E-posta" name="guestEmail" type="email" value={values.guestEmail} onChange={handleChange} />
        </FormRow>
      </div>

      {/* Otel Bilgileri */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Otel Bilgileri</h4>
        
        <FormRow columns={3}>
          <Input label="Otel Adı" name="hotelName" value={values.hotelName} onChange={handleChange} error={errors.hotelName} required />
          <Select
            label="Yıldız"
            name="hotelStars"
            value={values.hotelStars}
            onChange={handleChange}
            options={[
              { value: '3', label: '⭐⭐⭐' },
              { value: '4', label: '⭐⭐⭐⭐' },
              { value: '5', label: '⭐⭐⭐⭐⭐' },
            ]}
          />
          <Input label="Şehir" name="city" value={values.city} onChange={handleChange} />
        </FormRow>
      </div>

      {/* Rezervasyon Detayları */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Rezervasyon</h4>
        
        <FormRow columns={3}>
          <Input label="Giriş" name="checkIn" type="date" value={values.checkIn} onChange={handleChange} error={errors.checkIn} required />
          <Input label="Çıkış" name="checkOut" type="date" value={values.checkOut} onChange={handleChange} required />
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 0 8px 0' }}>
            <Badge variant="info" size="lg">🌙 {nights || 0} gece</Badge>
          </div>
        </FormRow>

        <FormRow columns={4}>
          <Select label="Oda Tipi" name="roomType" value={values.roomType} onChange={handleChange} options={roomTypeOptions} />
          <Input label="Oda Sayısı" name="roomCount" type="number" value={values.roomCount} onChange={handleChange} min={1} />
          <Select label="Pansiyon" name="boardType" value={values.boardType} onChange={handleChange} options={boardTypeOptions} />
          <Select label="Durum" name="status" value={values.status} onChange={handleChange} options={statusOptions} />
        </FormRow>

        <FormRow columns={3}>
          <Input label="Yetişkin" name="adults" type="number" value={values.adults} onChange={handleChange} min={1} />
          <Input label="Çocuk" name="children" type="number" value={values.children} onChange={handleChange} min={0} />
          <Input label="Konfirmasyon No" name="confirmationNo" value={values.confirmationNo} onChange={handleChange} />
        </FormRow>
      </div>

      {/* Ücret Bilgileri */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Ücret</h4>
        
        <FormRow columns={4}>
          <Input label="Gecelik Fiyat" name="pricePerNight" type="number" value={values.pricePerNight} onChange={handleChange} />
          <Input label="Toplam Tutar" name="totalPrice" type="number" value={values.totalPrice} onChange={handleChange} />
          <Select label="Para Birimi" name="currency" value={values.currency} onChange={handleChange} options={currencyOptions} />
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 0 8px 0' }}>
            <Badge variant="success" size="lg">💰 Kom: {formatCurrency(commission, values.currency)}</Badge>
          </div>
        </FormRow>

        <FormRow columns={2}>
          <Select
            label="Komisyon Tipi"
            name="commissionType"
            value={values.commissionType}
            onChange={handleChange}
            options={[
              { value: 'percent', label: 'Yüzde (%)' },
              { value: 'fixed', label: 'Sabit Tutar' },
            ]}
          />
          <Input
            label={values.commissionType === 'percent' ? 'Komisyon (%)' : 'Komisyon Tutarı'}
            name="commissionValue"
            type="number"
            value={values.commissionValue}
            onChange={handleChange}
          />
        </FormRow>
      </div>

      {/* Tedarikçi */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Tedarikçi</h4>
        
        <FormRow columns={2}>
          <Input label="Tedarikçi Adı" name="supplierName" value={values.supplierName} onChange={handleChange} />
          <Input label="Tedarikçi İletişim" name="supplierContact" value={values.supplierContact} onChange={handleChange} />
        </FormRow>
      </div>

      {/* Notlar */}
      <FormRow columns={2}>
        <Textarea label="Notlar" name="notes" value={values.notes} onChange={handleChange} rows={2} />
        <Textarea label="Özel İstekler" name="specialRequests" value={values.specialRequests} onChange={handleChange} rows={2} />
      </FormRow>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>İptal</Button>
        <Button type="submit" loading={loading}>{isEditing ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );
}

// ============================================================
// HOTELS PAGE (Main Container)
// ============================================================
export function HotelsPage() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const formModal = useModal();
  const toast = useToast();
  const { execute, loading: actionLoading } = useAsync();

  const loadData = async () => {
    setLoading(true);
    try {
      const [hotelResult, customerResult] = await Promise.all([
        hotelService.fetchAll(),
        customerService.fetchAll(),
      ]);
      
      if (hotelResult.error) throw new Error(hotelResult.error.message);
      if (customerResult.error) throw new Error(customerResult.error.message);
      
      setReservations(hotelResult.data || []);
      setCustomers(customerResult.data || []);
    } catch (err) {
      toast.error('Veri yüklenirken hata: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewReservation = () => formModal.open(null);
  const handleEditReservation = (reservation) => formModal.open(reservation);

  const handleSaveReservation = async (data) => {
    const isEditing = !!formModal.data;
    
    const result = await execute(async () => {
      if (isEditing) {
        return hotelService.update({ ...data, id: formModal.data.id });
      } else {
        return hotelService.create(data);
      }
    });

    if (result.success) {
      toast.success(isEditing ? 'Rezervasyon güncellendi' : 'Rezervasyon eklendi');
      formModal.close();
      loadData();
    } else {
      toast.error('Hata: ' + result.error);
    }
  };

  const handleDeleteReservation = async (id) => {
    const result = await execute(() => hotelService.delete(id));
    if (result.success) {
      toast.success('Rezervasyon silindi');
      loadData();
    } else {
      toast.error('Silme hatası: ' + result.error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const result = await execute(() => hotelService.update({ id, status: newStatus }));
    if (result.success) {
      toast.success('Durum güncellendi');
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
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 4px 0' }}>Otel Rezervasyonları</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Otel rezervasyonlarını yönetin</p>
        </div>
        <Button onClick={handleNewReservation}>+ Yeni Rezervasyon</Button>
      </div>

      {/* Stats */}
      <HotelStatsCards reservations={reservations} />

      {/* List */}
      <HotelList
        reservations={reservations}
        loading={loading}
        onSelect={handleEditReservation}
        onEdit={handleEditReservation}
        onDelete={handleDeleteReservation}
        onStatusChange={handleStatusChange}
      />

      {/* Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'} size="xl">
        <HotelForm
          reservation={formModal.data}
          customers={customers}
          onSave={handleSaveReservation}
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

export default HotelsPage;
