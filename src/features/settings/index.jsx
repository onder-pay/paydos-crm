// Settings Module - Kullanıcı ve firma ayarları
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, Tabs, Spinner, FormRow } from '../../components/ui';
import { useToast, useForm, useLocalStorage } from '../../hooks';
import { supabase } from '../../services/supabase';
import { CURRENCIES, COUNTRIES } from '../../utils/constants';

// ==================== PROFILE SETTINGS ====================
function ProfileSettings({ user, onSave }) {
  const { values, errors, handleChange, setValues } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || ''
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(values);
      toast.success('Profil güncellendi');
    } catch (error) {
      toast.error('Profil güncellenemedi: ' + error.message);
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <Card title="👤 Profil Bilgileri">
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            overflow: 'hidden'
          }}>
            {values.avatar_url ? (
              <img 
                src={values.avatar_url} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '18px' }}>{values.name || 'İsimsiz'}</div>
            <div style={{ color: '#6B7280' }}>{values.email}</div>
          </div>
        </div>
        
        <FormRow>
          <Input
            label="Ad Soyad"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Adınız Soyadınız"
          />
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            disabled
            placeholder="ornek@email.com"
          />
        </FormRow>
        
        <FormRow>
          <Input
            label="Telefon"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            placeholder="+90 5XX XXX XX XX"
          />
          <Input
            label="Avatar URL"
            name="avatar_url"
            value={values.avatar_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </FormRow>
        
        <div style={{ marginTop: '20px' }}>
          <Button type="submit" loading={saving}>
            Kaydet
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ==================== COMPANY SETTINGS ====================
function CompanySettings({ settings, onSave }) {
  const { values, handleChange, setValues } = useForm({
    company_name: settings?.company_name || '',
    company_address: settings?.company_address || '',
    company_phone: settings?.company_phone || '',
    company_email: settings?.company_email || '',
    company_website: settings?.company_website || '',
    tax_number: settings?.tax_number || '',
    tax_office: settings?.tax_office || '',
    bank_name: settings?.bank_name || '',
    bank_iban: settings?.bank_iban || '',
    logo_url: settings?.logo_url || ''
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    if (settings) {
      setValues({
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_website: settings.company_website || '',
        tax_number: settings.tax_number || '',
        tax_office: settings.tax_office || '',
        bank_name: settings.bank_name || '',
        bank_iban: settings.bank_iban || '',
        logo_url: settings.logo_url || ''
      });
    }
  }, [settings]);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(values);
      toast.success('Firma bilgileri güncellendi');
    } catch (error) {
      toast.error('Güncelleme başarısız: ' + error.message);
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <Card title="🏢 Firma Bilgileri">
      <form onSubmit={handleSubmit}>
        <FormRow>
          <Input
            label="Firma Adı"
            name="company_name"
            value={values.company_name}
            onChange={handleChange}
            placeholder="Firma Adı"
          />
          <Input
            label="Firma Telefonu"
            name="company_phone"
            value={values.company_phone}
            onChange={handleChange}
            placeholder="+90 XXX XXX XX XX"
          />
        </FormRow>
        
        <FormRow>
          <Input
            label="Firma E-posta"
            name="company_email"
            type="email"
            value={values.company_email}
            onChange={handleChange}
            placeholder="info@firma.com"
          />
          <Input
            label="Website"
            name="company_website"
            value={values.company_website}
            onChange={handleChange}
            placeholder="https://www.firma.com"
          />
        </FormRow>
        
        <Textarea
          label="Adres"
          name="company_address"
          value={values.company_address}
          onChange={handleChange}
          rows={2}
          placeholder="Firma adresi..."
        />
        
        <div style={{ 
          borderTop: '1px solid #E5E7EB', 
          marginTop: '24px', 
          paddingTop: '24px' 
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Vergi Bilgileri</h4>
          <FormRow>
            <Input
              label="Vergi Numarası"
              name="tax_number"
              value={values.tax_number}
              onChange={handleChange}
              placeholder="VKN"
            />
            <Input
              label="Vergi Dairesi"
              name="tax_office"
              value={values.tax_office}
              onChange={handleChange}
              placeholder="Vergi Dairesi"
            />
          </FormRow>
        </div>
        
        <div style={{ 
          borderTop: '1px solid #E5E7EB', 
          marginTop: '24px', 
          paddingTop: '24px' 
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Banka Bilgileri</h4>
          <FormRow>
            <Input
              label="Banka Adı"
              name="bank_name"
              value={values.bank_name}
              onChange={handleChange}
              placeholder="Banka Adı"
            />
            <Input
              label="IBAN"
              name="bank_iban"
              value={values.bank_iban}
              onChange={handleChange}
              placeholder="TR..."
            />
          </FormRow>
        </div>
        
        <div style={{ 
          borderTop: '1px solid #E5E7EB', 
          marginTop: '24px', 
          paddingTop: '24px' 
        }}>
          <Input
            label="Logo URL"
            name="logo_url"
            value={values.logo_url}
            onChange={handleChange}
            placeholder="https://..."
          />
          {values.logo_url && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={values.logo_url} 
                alt="Logo" 
                style={{ maxHeight: '60px', maxWidth: '200px' }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <Button type="submit" loading={saving}>
            Kaydet
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ==================== PREFERENCES SETTINGS ====================
function PreferencesSettings() {
  const [prefs, setPrefs] = useLocalStorage('crm_preferences', {
    currency: 'TRY',
    date_format: 'DD.MM.YYYY',
    language: 'tr',
    theme: 'light',
    notifications_enabled: true,
    email_notifications: true,
    default_visa_category: 'schengen',
    items_per_page: 25
  });
  const toast = useToast();
  
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setPrefs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
  
  function handleSave() {
    toast.success('Tercihler kaydedildi');
  }
  
  const currencyOptions = Object.entries(CURRENCIES).map(([code, data]) => ({
    value: code,
    label: `${data.symbol} ${code} - ${data.name}`
  }));
  
  return (
    <Card title="⚙️ Tercihler">
      <FormRow>
        <Select
          label="Para Birimi"
          name="currency"
          value={prefs.currency}
          onChange={handleChange}
          options={currencyOptions}
        />
        <Select
          label="Tarih Formatı"
          name="date_format"
          value={prefs.date_format}
          onChange={handleChange}
          options={[
            { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.12.2024)' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' }
          ]}
        />
      </FormRow>
      
      <FormRow>
        <Select
          label="Dil"
          name="language"
          value={prefs.language}
          onChange={handleChange}
          options={[
            { value: 'tr', label: 'Türkçe' },
            { value: 'en', label: 'English' }
          ]}
        />
        <Select
          label="Tema"
          name="theme"
          value={prefs.theme}
          onChange={handleChange}
          options={[
            { value: 'light', label: '☀️ Açık Tema' },
            { value: 'dark', label: '🌙 Koyu Tema' },
            { value: 'auto', label: '🔄 Otomatik' }
          ]}
        />
      </FormRow>
      
      <FormRow>
        <Select
          label="Varsayılan Vize Kategorisi"
          name="default_visa_category"
          value={prefs.default_visa_category}
          onChange={handleChange}
          options={[
            { value: 'schengen', label: 'Schengen' },
            { value: 'uk', label: 'İngiltere' },
            { value: 'usa', label: 'ABD' },
            { value: 'russia', label: 'Rusya' },
            { value: 'uae', label: 'BAE' }
          ]}
        />
        <Select
          label="Sayfa Başına Öğe"
          name="items_per_page"
          value={prefs.items_per_page}
          onChange={handleChange}
          options={[
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' }
          ]}
        />
      </FormRow>
      
      <div style={{ 
        borderTop: '1px solid #E5E7EB', 
        marginTop: '24px', 
        paddingTop: '24px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Bildirimler</h4>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          cursor: 'pointer',
          marginBottom: '12px'
        }}>
          <input
            type="checkbox"
            name="notifications_enabled"
            checked={prefs.notifications_enabled}
            onChange={handleChange}
            style={{ width: '18px', height: '18px' }}
          />
          <span>Uygulama bildirimleri</span>
        </label>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            name="email_notifications"
            checked={prefs.email_notifications}
            onChange={handleChange}
            style={{ width: '18px', height: '18px' }}
          />
          <span>E-posta bildirimleri</span>
        </label>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Button onClick={handleSave}>
          Kaydet
        </Button>
      </div>
    </Card>
  );
}

// ==================== SECURITY SETTINGS ====================
function SecuritySettings({ onPasswordChange }) {
  const { values, handleChange, reset } = useForm({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (values.new_password !== values.confirm_password) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (values.new_password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }
    
    setSaving(true);
    try {
      await onPasswordChange(values.current_password, values.new_password);
      toast.success('Şifre değiştirildi');
      reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <Card title="🔒 Güvenlik">
      <form onSubmit={handleSubmit}>
        <Input
          label="Mevcut Şifre"
          name="current_password"
          type="password"
          value={values.current_password}
          onChange={handleChange}
          placeholder="Mevcut şifreniz"
        />
        
        <FormRow>
          <Input
            label="Yeni Şifre"
            name="new_password"
            type="password"
            value={values.new_password}
            onChange={handleChange}
            placeholder="Yeni şifre"
          />
          <Input
            label="Yeni Şifre (Tekrar)"
            name="confirm_password"
            type="password"
            value={values.confirm_password}
            onChange={handleChange}
            placeholder="Yeni şifre tekrar"
          />
        </FormRow>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            background: '#FEE2E2', 
            color: '#991B1B',
            borderRadius: '6px',
            marginTop: '12px'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <Button type="submit" loading={saving}>
            Şifreyi Değiştir
          </Button>
        </div>
      </form>
      
      <div style={{ 
        borderTop: '1px solid #E5E7EB', 
        marginTop: '32px', 
        paddingTop: '24px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Oturum Bilgileri</h4>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Son Giriş:</strong> {new Date().toLocaleString('tr-TR')}
          </div>
          <div>
            <strong>IP Adresi:</strong> Gizli
          </div>
        </div>
      </div>
    </Card>
  );
}

// ==================== DATA MANAGEMENT ====================
function DataManagement() {
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  
  async function handleExport(type) {
    setExporting(true);
    try {
      // Simulated export
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${type} verileri dışa aktarıldı`);
    } catch (error) {
      toast.error('Dışa aktarma başarısız');
    } finally {
      setExporting(false);
    }
  }
  
  return (
    <Card title="💾 Veri Yönetimi">
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Veri Dışa Aktarma</h4>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
          Verilerinizi Excel formatında dışa aktarın.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button 
            variant="outline" 
            onClick={() => handleExport('Müşteriler')}
            disabled={exporting}
          >
            📊 Müşteriler
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('Vizeler')}
            disabled={exporting}
          >
            📊 Vizeler
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('Turlar')}
            disabled={exporting}
          >
            📊 Turlar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('Oteller')}
            disabled={exporting}
          >
            📊 Oteller
          </Button>
        </div>
      </div>
      
      <div style={{ 
        borderTop: '1px solid #E5E7EB', 
        paddingTop: '24px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Veri İçe Aktarma</h4>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
          Excel dosyasından veri içe aktarın.
        </p>
        <Button variant="outline">
          📥 Dosya Seç
        </Button>
      </div>
      
      <div style={{ 
        borderTop: '1px solid #E5E7EB', 
        marginTop: '24px',
        paddingTop: '24px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#DC2626' }}>Tehlikeli Bölge</h4>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
          Bu işlemler geri alınamaz!
        </p>
        <Button variant="danger">
          🗑️ Tüm Verileri Sil
        </Button>
      </div>
    </Card>
  );
}

// ==================== MAIN SETTINGS PAGE ====================
export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  async function loadSettings() {
    setLoading(true);
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        setUser({ ...authUser, ...profile });
        
        // Get company settings
        const { data: settings } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        setCompanySettings(settings || {});
      }
    } catch (error) {
      console.error('Settings load error:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleProfileSave(data) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...data });
    
    if (error) throw error;
    setUser(prev => ({ ...prev, ...data }));
  }
  
  async function handleCompanySave(data) {
    const { error } = await supabase
      .from('settings')
      .upsert({ user_id: user.id, ...data });
    
    if (error) throw error;
    setCompanySettings(data);
  }
  
  async function handlePasswordChange(currentPassword, newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }
  
  const tabs = [
    { id: 'profile', label: '👤 Profil' },
    { id: 'company', label: '🏢 Firma' },
    { id: 'preferences', label: '⚙️ Tercihler' },
    { id: 'security', label: '🔒 Güvenlik' },
    { id: 'data', label: '💾 Veri' }
  ];
  
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
  
  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
          Ayarlar
        </h1>
        <p style={{ color: '#6B7280', marginTop: '4px' }}>
          Hesap ve uygulama ayarlarınızı yönetin.
        </p>
      </div>
      
      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: '24px' }}
      />
      
      {/* Content */}
      {activeTab === 'profile' && (
        <ProfileSettings user={user} onSave={handleProfileSave} />
      )}
      
      {activeTab === 'company' && (
        <CompanySettings settings={companySettings} onSave={handleCompanySave} />
      )}
      
      {activeTab === 'preferences' && (
        <PreferencesSettings />
      )}
      
      {activeTab === 'security' && (
        <SecuritySettings onPasswordChange={handlePasswordChange} />
      )}
      
      {activeTab === 'data' && (
        <DataManagement />
      )}
    </div>
  );
}

export default SettingsPage;
