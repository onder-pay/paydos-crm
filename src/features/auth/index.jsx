// Auth Module - Kimlik doğrulama ve yetkilendirme
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../../services/supabase';
import { Button, Input, Card, Spinner } from '../../components/ui';
import { useForm } from '../../hooks';
import { isValidEmail } from '../../utils/helpers';

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  async function loadProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Profile load error:', error);
    }
  }
  
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }
  
  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    
    // Create profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        name: metadata.name || '',
        created_at: new Date().toISOString()
      });
    }
    
    return data;
  }
  
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  }
  
  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  }
  
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
  
  async function updateProfile(updates) {
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
  }
  
  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== LOGIN PAGE ====================
export function LoginPage({ onNavigate }) {
  const { signIn } = useAuth();
  const { values, handleChange, errors, setErrors } = useForm({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!values.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!isValidEmail(values.email)) {
      newErrors.email = 'Geçerli bir e-posta girin';
    }
    if (!values.password) {
      newErrors.password = 'Şifre gerekli';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      // Auth state change will handle redirect
    } catch (error) {
      if (error.message.includes('Invalid login')) {
        setGeneralError('E-posta veya şifre hatalı');
      } else {
        setGeneralError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
          <h1 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Paydos CRM
          </h1>
          <p style={{ color: '#94A3B8', margin: '8px 0 0', fontSize: '14px' }}>
            Turizm Yönetim Sistemi
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ 
            margin: '0 0 24px', 
            fontSize: '20px', 
            color: '#111827',
            textAlign: 'center'
          }}>
            Giriş Yap
          </h2>
          
          {generalError && (
            <div style={{
              padding: '12px',
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {generalError}
            </div>
          )}
          
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ornek@email.com"
            autoComplete="email"
          />
          
          <Input
            label="Şifre"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          
          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Giriş Yap
          </Button>
          
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            <button
              type="button"
              onClick={() => onNavigate?.('forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Şifremi Unuttum
            </button>
          </div>
          
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Kayıt Ol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== REGISTER PAGE ====================
export function RegisterPage({ onNavigate }) {
  const { signUp } = useAuth();
  const { values, handleChange, errors, setErrors } = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!values.name) {
      newErrors.name = 'İsim gerekli';
    }
    if (!values.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!isValidEmail(values.email)) {
      newErrors.email = 'Geçerli bir e-posta girin';
    }
    if (!values.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (values.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await signUp(values.email, values.password, { name: values.name });
      setSuccess(true);
    } catch (error) {
      if (error.message.includes('already registered')) {
        setGeneralError('Bu e-posta zaten kayıtlı');
      } else {
        setGeneralError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✉️</div>
          <h2 style={{ margin: '0 0 12px', color: '#111827' }}>Kayıt Başarılı!</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            E-posta adresinize bir doğrulama bağlantısı gönderdik. 
            Lütfen e-postanızı kontrol edin.
          </p>
          <Button onClick={() => onNavigate?.('login')}>
            Giriş Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
          <h1 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Paydos CRM
          </h1>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ 
            margin: '0 0 24px', 
            fontSize: '20px', 
            color: '#111827',
            textAlign: 'center'
          }}>
            Kayıt Ol
          </h2>
          
          {generalError && (
            <div style={{
              padding: '12px',
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {generalError}
            </div>
          )}
          
          <Input
            label="Ad Soyad"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Adınız Soyadınız"
          />
          
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ornek@email.com"
          />
          
          <Input
            label="Şifre"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="En az 6 karakter"
          />
          
          <Input
            label="Şifre (Tekrar)"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Şifreyi tekrar girin"
          />
          
          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Kayıt Ol
          </Button>
          
          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== FORGOT PASSWORD PAGE ====================
export function ForgotPasswordPage({ onNavigate }) {
  const { resetPassword } = useAuth();
  const { values, handleChange, errors, setErrors } = useForm({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    
    if (!values.email) {
      setErrors({ email: 'E-posta gerekli' });
      return;
    }
    if (!isValidEmail(values.email)) {
      setErrors({ email: 'Geçerli bir e-posta girin' });
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(values.email);
      setSuccess(true);
    } catch (error) {
      setGeneralError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✉️</div>
          <h2 style={{ margin: '0 0 12px', color: '#111827' }}>E-posta Gönderildi!</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Şifre sıfırlama bağlantısını {values.email} adresine gönderdik.
          </p>
          <Button onClick={() => onNavigate?.('login')}>
            Giriş Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔑</div>
          <h2 style={{ margin: '0 0 8px', color: '#111827' }}>Şifremi Unuttum</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>
        
        {generalError && (
          <div style={{
            padding: '12px',
            background: '#FEE2E2',
            color: '#991B1B',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {generalError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="E-posta"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ornek@email.com"
          />
          
          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Sıfırlama Bağlantısı Gönder
          </Button>
        </form>
        
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <button
            type="button"
            onClick={() => onNavigate?.('login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366F1',
              cursor: 'pointer'
            }}
          >
            ← Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PROTECTED ROUTE ====================
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth();
  
  if (!initialized || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Will be handled by router
    return null;
  }
  
  return children;
}

// ==================== AUTH WRAPPER (for simple apps without router) ====================
export function AuthWrapper({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  
  if (!initialized || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    switch (authPage) {
      case 'register':
        return <RegisterPage onNavigate={setAuthPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setAuthPage} />;
      default:
        return <LoginPage onNavigate={setAuthPage} />;
    }
  }
  
  return children;
}

export default {
  AuthProvider,
  useAuth,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ProtectedRoute,
  AuthWrapper
};
