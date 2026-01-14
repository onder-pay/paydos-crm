// Dashboard Module - Ana sayfa istatistikleri ve özet görünüm
import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, EmptyState } from '../../components/ui';
import { customerService, visaService, tourService, hotelService } from '../../services/supabase';
import { formatCurrency, formatDate, calculateDaysUntil, getStatusColor, getStatusText } from '../../utils/helpers';
import { VISA_STATUSES, TOUR_STATUSES, HOTEL_STATUSES } from '../../utils/constants';

// ==================== STAT CARD ====================
function StatCard({ title, value, subtitle, icon, color = 'blue', trend, onClick }) {
  const colors = {
    blue: { bg: '#EBF5FF', border: '#3B82F6', text: '#1E40AF' },
    green: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
    yellow: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    red: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
    purple: { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6' },
    gray: { bg: '#F9FAFB', border: '#6B7280', text: '#374151' }
  };
  
  const c = colors[color] || colors.blue;
  
  return (
    <div
      onClick={onClick}
      style={{
        background: c.bg,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: '8px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: c.text }}>{value}</div>
          {subtitle && (
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>{subtitle}</div>
          )}
        </div>
        {icon && (
          <div style={{ fontSize: '24px', opacity: 0.7 }}>{icon}</div>
        )}
      </div>
      {trend && (
        <div style={{ 
          marginTop: '12px', 
          fontSize: '13px',
          color: trend.type === 'up' ? '#10B981' : trend.type === 'down' ? '#EF4444' : '#6B7280'
        }}>
          {trend.type === 'up' ? '↑' : trend.type === 'down' ? '↓' : '→'} {trend.text}
        </div>
      )}
    </div>
  );
}

// ==================== QUICK STATS ROW ====================
function QuickStatsRow({ stats }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      <StatCard
        title="Toplam Müşteri"
        value={stats.customers.total}
        subtitle={`${stats.customers.thisMonth} bu ay eklendi`}
        icon="👥"
        color="blue"
      />
      <StatCard
        title="Aktif Vize Başvuruları"
        value={stats.visa.active}
        subtitle={`${stats.visa.pending} onay bekliyor`}
        icon="📋"
        color="yellow"
      />
      <StatCard
        title="Yaklaşan Turlar"
        value={stats.tours.upcoming}
        subtitle={`${stats.tours.totalParticipants} katılımcı`}
        icon="✈️"
        color="green"
      />
      <StatCard
        title="Otel Rezervasyonları"
        value={stats.hotels.active}
        subtitle={formatCurrency(stats.hotels.totalCommission) + ' komisyon'}
        icon="🏨"
        color="purple"
      />
    </div>
  );
}

// ==================== URGENT ITEMS ====================
function UrgentItems({ items, onItemClick }) {
  if (items.length === 0) {
    return (
      <Card title="⚡ Acil İşlemler" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#10B981' }}>
          ✓ Acil işlem bulunmuyor
        </div>
      </Card>
    );
  }
  
  return (
    <Card title={`⚡ Acil İşlemler (${items.length})`} style={{ marginBottom: '24px' }}>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => onItemClick?.(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: index < items.length - 1 ? '1px solid #E5E7EB' : 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: item.urgency === 'critical' ? '#FEE2E2' : '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: '#111827' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{item.subtitle}</div>
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              background: item.urgency === 'critical' ? '#FEE2E2' : '#FEF3C7',
              color: item.urgency === 'critical' ? '#991B1B' : '#92400E'
            }}>
              {item.daysText}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== RECENT ACTIVITIES ====================
function RecentActivities({ activities }) {
  if (activities.length === 0) {
    return (
      <Card title="📊 Son Aktiviteler">
        <EmptyState
          icon="📊"
          title="Henüz aktivite yok"
          description="Sistem aktiviteleri burada görünecek"
        />
      </Card>
    );
  }
  
  const getActivityIcon = (type) => {
    const icons = {
      customer_added: '👤',
      visa_created: '📋',
      visa_approved: '✅',
      visa_rejected: '❌',
      tour_created: '✈️',
      tour_started: '🚀',
      hotel_booked: '🏨',
      hotel_confirmed: '✓'
    };
    return icons[type] || '📌';
  };
  
  return (
    <Card title="📊 Son Aktiviteler">
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activities.map((activity, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px 0',
              borderBottom: index < activities.length - 1 ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              flexShrink: 0
            }}>
              {getActivityIcon(activity.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {activity.text}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== UPCOMING EVENTS ====================
function UpcomingEvents({ events }) {
  if (events.length === 0) return null;
  
  return (
    <Card title="📅 Yaklaşan Etkinlikler" style={{ marginBottom: '24px' }}>
      <div>
        {events.map((event, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 0',
              borderBottom: index < events.length - 1 ? '1px solid #E5E7EB' : 'none'
            }}
          >
            <div style={{
              width: '50px',
              textAlign: 'center',
              padding: '8px',
              background: '#EBF5FF',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E40AF' }}>
                {new Date(event.date).getDate()}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>
                {new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' })}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: '#111827' }}>{event.title}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{event.subtitle}</div>
            </div>
            <Badge variant={event.type === 'tour' ? 'success' : event.type === 'visa' ? 'warning' : 'default'}>
              {event.type === 'tour' ? 'Tur' : event.type === 'visa' ? 'Randevu' : 'Etkinlik'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== VISA STATUS OVERVIEW ====================
function VisaStatusOverview({ visaStats }) {
  const statuses = [
    { key: 'pending', label: 'Beklemede', color: '#F59E0B' },
    { key: 'documents_ready', label: 'Evraklar Hazır', color: '#3B82F6' },
    { key: 'appointment_scheduled', label: 'Randevu Alındı', color: '#8B5CF6' },
    { key: 'approved', label: 'Onaylandı', color: '#10B981' },
    { key: 'rejected', label: 'Reddedildi', color: '#EF4444' }
  ];
  
  const total = Object.values(visaStats).reduce((sum, val) => sum + val, 0);
  
  return (
    <Card title="📊 Vize Durumu Özeti" style={{ marginBottom: '24px' }}>
      {/* Progress bar */}
      <div style={{ 
        height: '24px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        display: 'flex',
        background: '#E5E7EB',
        marginBottom: '16px'
      }}>
        {statuses.map(status => {
          const count = visaStats[status.key] || 0;
          const percent = total > 0 ? (count / total) * 100 : 0;
          if (percent === 0) return null;
          return (
            <div
              key={status.key}
              style={{
                width: `${percent}%`,
                background: status.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                color: 'white',
                minWidth: count > 0 ? '30px' : 0
              }}
              title={`${status.label}: ${count}`}
            >
              {percent > 10 ? count : ''}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {statuses.map(status => (
          <div key={status.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: status.color
            }} />
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              {status.label}: <strong>{visaStats[status.key] || 0}</strong>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== MONTHLY CHART (Simple) ====================
function MonthlyChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <Card title={title}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '150px', padding: '10px 0' }}>
        {data.map((item, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '40px',
              height: `${(item.value / maxValue) * 120}px`,
              minHeight: '4px',
              background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s'
            }} />
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==================== MAIN DASHBOARD PAGE ====================
export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: { total: 0, thisMonth: 0 },
    visa: { total: 0, active: 0, pending: 0, approved: 0, rejected: 0 },
    tours: { total: 0, upcoming: 0, active: 0, totalParticipants: 0 },
    hotels: { total: 0, active: 0, confirmed: 0, totalCommission: 0 }
  });
  const [urgentItems, setUrgentItems] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [visaStatusStats, setVisaStatusStats] = useState({});
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  async function loadDashboardData() {
    setLoading(true);
    try {
      // Parallel data loading
      const [customersRes, visasRes, toursRes, hotelsRes] = await Promise.all([
        customerService.getAll(),
        visaService.getAll(),
        tourService.getAll(),
        hotelService.getAll()
      ]);
      
      const customers = customersRes.data || [];
      const visas = visasRes.data || [];
      const tours = toursRes.data || [];
      const hotels = hotelsRes.data || [];
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate customer stats
      const customersThisMonth = customers.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length;
      
      // Calculate visa stats
      const activeVisas = visas.filter(v => 
        !['approved', 'rejected', 'cancelled'].includes(v.status)
      );
      const pendingVisas = visas.filter(v => v.status === 'pending');
      const approvedVisas = visas.filter(v => v.status === 'approved');
      const rejectedVisas = visas.filter(v => v.status === 'rejected');
      
      // Visa status breakdown
      const visaStatusBreakdown = {};
      visas.forEach(v => {
        visaStatusBreakdown[v.status] = (visaStatusBreakdown[v.status] || 0) + 1;
      });
      setVisaStatusStats(visaStatusBreakdown);
      
      // Calculate tour stats
      const upcomingTours = tours.filter(t => 
        new Date(t.start_date) > now && t.status !== 'cancelled'
      );
      const activeTours = tours.filter(t => 
        new Date(t.start_date) <= now && 
        new Date(t.end_date) >= now && 
        t.status === 'active'
      );
      const totalParticipants = upcomingTours.reduce((sum, t) => 
        sum + (t.participants?.length || 0), 0
      );
      
      // Calculate hotel stats
      const activeHotels = hotels.filter(h => 
        new Date(h.check_out) >= now && h.status !== 'cancelled'
      );
      const confirmedHotels = hotels.filter(h => h.status === 'confirmed');
      const totalCommission = hotels.reduce((sum, h) => {
        if (h.commission_type === 'percent') {
          return sum + ((h.total_price || 0) * (h.commission_rate || 0) / 100);
        }
        return sum + (h.commission_rate || 0);
      }, 0);
      
      setStats({
        customers: { total: customers.length, thisMonth: customersThisMonth },
        visa: { 
          total: visas.length, 
          active: activeVisas.length, 
          pending: pendingVisas.length,
          approved: approvedVisas.length,
          rejected: rejectedVisas.length
        },
        tours: { 
          total: tours.length, 
          upcoming: upcomingTours.length, 
          active: activeTours.length,
          totalParticipants 
        },
        hotels: { 
          total: hotels.length, 
          active: activeHotels.length, 
          confirmed: confirmedHotels.length,
          totalCommission 
        }
      });
      
      // Build urgent items
      const urgent = [];
      
      // Visa appointments in next 3 days
      visas.forEach(v => {
        if (v.appointment_date) {
          const days = calculateDaysUntil(v.appointment_date);
          if (days >= 0 && days <= 3) {
            urgent.push({
              type: 'visa',
              icon: '📋',
              title: `Vize Randevusu: ${v.customer?.name || 'Müşteri'}`,
              subtitle: `${v.country} - ${formatDate(v.appointment_date)}`,
              daysText: days === 0 ? 'BUGÜN' : days === 1 ? 'YARIN' : `${days} gün`,
              urgency: days <= 1 ? 'critical' : 'warning',
              data: v
            });
          }
        }
      });
      
      // Tours starting in next 7 days
      tours.forEach(t => {
        if (t.status !== 'cancelled') {
          const days = calculateDaysUntil(t.start_date);
          if (days >= 0 && days <= 7) {
            urgent.push({
              type: 'tour',
              icon: '✈️',
              title: `Tur Başlangıcı: ${t.name}`,
              subtitle: `${t.participants?.length || 0} katılımcı`,
              daysText: days === 0 ? 'BUGÜN' : days === 1 ? 'YARIN' : `${days} gün`,
              urgency: days <= 2 ? 'critical' : 'warning',
              data: t
            });
          }
        }
      });
      
      // Expiring passports (within 6 months)
      customers.forEach(c => {
        if (c.passport_expiry) {
          const days = calculateDaysUntil(c.passport_expiry);
          if (days >= 0 && days <= 180) {
            urgent.push({
              type: 'passport',
              icon: '🛂',
              title: `Pasaport Bitiyor: ${c.name}`,
              subtitle: formatDate(c.passport_expiry),
              daysText: days <= 30 ? `${days} gün` : `${Math.floor(days / 30)} ay`,
              urgency: days <= 30 ? 'critical' : 'warning',
              data: c
            });
          }
        }
      });
      
      // Sort by urgency
      urgent.sort((a, b) => {
        if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
        if (a.urgency !== 'critical' && b.urgency === 'critical') return 1;
        return 0;
      });
      
      setUrgentItems(urgent.slice(0, 10));
      
      // Build upcoming events
      const events = [];
      
      upcomingTours.slice(0, 5).forEach(t => {
        events.push({
          type: 'tour',
          date: t.start_date,
          title: t.name,
          subtitle: `${t.destination} • ${t.participants?.length || 0} kişi`
        });
      });
      
      visas.filter(v => v.appointment_date && calculateDaysUntil(v.appointment_date) >= 0)
        .slice(0, 5)
        .forEach(v => {
          events.push({
            type: 'visa',
            date: v.appointment_date,
            title: `${v.customer?.name || 'Müşteri'} - ${v.country}`,
            subtitle: 'Vize Randevusu'
          });
        });
      
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingEvents(events.slice(0, 8));
      
      // Build recent activities (simulated from data timestamps)
      const activities = [];
      
      customers.slice(0, 3).forEach(c => {
        activities.push({
          type: 'customer_added',
          text: `${c.name} müşteri olarak eklendi`,
          time: formatDate(c.created_at),
          timestamp: new Date(c.created_at)
        });
      });
      
      visas.slice(0, 3).forEach(v => {
        activities.push({
          type: v.status === 'approved' ? 'visa_approved' : 
                v.status === 'rejected' ? 'visa_rejected' : 'visa_created',
          text: `${v.customer?.name || 'Müşteri'} - ${v.country} vizesi ${
            v.status === 'approved' ? 'onaylandı' : 
            v.status === 'rejected' ? 'reddedildi' : 'oluşturuldu'
          }`,
          time: formatDate(v.updated_at || v.created_at),
          timestamp: new Date(v.updated_at || v.created_at)
        });
      });
      
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 10));
      
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Monthly data for chart (last 6 months)
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData.push({
      label: months[d.getMonth()],
      value: Math.floor(Math.random() * 20) + 5 // Placeholder - would need real data
    });
  }
  
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#6B7280', marginTop: '4px' }}>
          Hoş geldiniz! İşte güncel durumunuz.
        </p>
      </div>
      
      {/* Quick Stats */}
      <QuickStatsRow stats={stats} />
      
      {/* Urgent Items */}
      <UrgentItems items={urgentItems} />
      
      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          {/* Visa Status Overview */}
          <VisaStatusOverview visaStats={visaStatusStats} />
          
          {/* Upcoming Events */}
          <UpcomingEvents events={upcomingEvents} />
        </div>
        
        <div>
          {/* Recent Activities */}
          <RecentActivities activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
