import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import SettingsClient from './SettingsClient';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <div data-testid="user-icon">👤</div>,
  Cog6ToothIcon: () => <div data-testid="cog-icon">⚙️</div>,
  CreditCardIcon: () => <div data-testid="credit-card-icon">💳</div>,
  SunIcon: () => <div data-testid="sun-icon">☀️</div>,
  MoonIcon: () => <div data-testid="moon-icon">🌙</div>,
  CheckCircleIcon: () => <div data-testid="check-circle-icon">✅</div>,
  XCircleIcon: () => <div data-testid="x-circle-icon">❌</div>,
  ArrowTopRightOnSquareIcon: () => <div data-testid="external-link-icon">🔗</div>,
  CalendarDaysIcon: () => <div data-testid="calendar-icon">📅</div>,
  SparklesIcon: () => <div data-testid="sparkles-icon">✨</div>,
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
} as any;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SettingsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  const mockProfile = {
    id: '123',
    full_name: 'Test User',
    is_premium: false,
    premium_until: null,
  } as any;

  const mockUser = {
    email: 'test@example.com',
    id: '123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as any;

  const defaultAuthState = {
    user: mockUser,
    profile: mockProfile,
    loading: false,
    signOut: jest.fn(),
    signInWithGoogle: jest.fn(),
    signUpWithGoogle: jest.fn(),
  } as any;

  it('renders settings page with user information', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
    expect(screen.getByText('Hesap ayarlarınızı ve tercihlerinizi yönetin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('displays account information section', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.getByText('Hesap Bilgileri')).toBeInTheDocument();
    expect(screen.getByText('Kişisel bilgileriniz')).toBeInTheDocument();
    expect(screen.getByLabelText('E-posta')).toBeInTheDocument();
    expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument();
  });

  it('displays subscription management for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.getByText('Üyelik Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Premium aboneliğinizi yönetin')).toBeInTheDocument();
    expect(screen.getByText('Ücretsiz Üye')).toBeInTheDocument();
    expect(screen.getByText(/Premium özelliklere erişmek için yükseltin/)).toBeInTheDocument();
    expect(screen.getByText('Premium\'a Geç')).toBeInTheDocument();
  });

  it('displays subscription management for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true, premium_until: '2024-12-31' };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<SettingsClient />);

    expect(screen.getByText('Premium Üye')).toBeInTheDocument();
    expect(screen.getByText(/Premium üyeliğiniz 31 Aralık 2024 tarihine kadar geçerli/)).toBeInTheDocument();
    expect(screen.getByText('Abonelik Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Aboneliği Yönet')).toBeInTheDocument();
  });

  it('shows subscription management section for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<SettingsClient />);

    expect(screen.getByText('Abonelik Yönetimi')).toBeInTheDocument();
    expect(screen.getByText(/Aboneliğinizi yönetmek, ödeme yöntemini değiştirmek veya iptal etmek için Gumroad hesabınıza gidin/)).toBeInTheDocument();
  });

  it('does not show subscription management section for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.queryByText('Abonelik Yönetimi')).not.toBeInTheDocument();
  });

  it('displays premium features list', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.getByText('Premium Özellikler')).toBeInTheDocument();
    expect(screen.getByText('• Günde 5 quiz oluşturma hakkı')).toBeInTheDocument();
    expect(screen.getByText('• Detaylı açıklamalar ve analizler')).toBeInTheDocument();
    expect(screen.getByText('• Zaman sınırlı quizler')).toBeInTheDocument();
    expect(screen.getByText('• PDF indirme özelliği')).toBeInTheDocument();
    expect(screen.getByText('• Kişiselleştirilmiş AI tavsiyeleri')).toBeInTheDocument();
  });

  it('displays theme settings section', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(screen.getByText('Görünüm')).toBeInTheDocument();
    expect(screen.getByText('Tema tercihleriniz')).toBeInTheDocument();
    expect(screen.getByText('Karanlık Mod')).toBeInTheDocument();
    expect(screen.getByText('Karanlık tema kullanın')).toBeInTheDocument();
  });

  it('toggles dark mode when button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    const darkModeToggle = screen.getByRole('button', { name: /disable dark mode/i });
    fireEvent.click(darkModeToggle);

    expect(screen.getByRole('button', { name: /enable dark mode/i })).toBeInTheDocument();
  });

  it('handles subscription management button click', async () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    render(<SettingsClient />);

    const manageButton = screen.getByText('Aboneliği Yönet');
    fireEvent.click(manageButton);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('gumroad.com/account/subscriptions'),
        '_blank'
      );
    });
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, user: null });

    render(<SettingsClient />);

    expect(mockRouter.push).toHaveBeenCalledWith('/giris');
  });

  it('shows loading state when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, user: null });

    render(<SettingsClient />);

    expect(screen.getByText('Yönlendiriliyor...')).toBeInTheDocument();
  });

  it('formats date correctly for premium users', () => {
    const premiumProfile = { 
      ...mockProfile, 
      is_premium: true, 
      premium_until: '2024-12-31T23:59:59Z' 
    };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<SettingsClient />);

    // The date will be formatted in Turkish locale, so it could be "31 Aralık 2024" or similar
    expect(screen.getByText(/Premium üyeliğiniz.*tarihine kadar geçerli/)).toBeInTheDocument();
  });

  it('shows "Süresiz" for premium users without expiration date', () => {
    const premiumProfile = { ...mockProfile, is_premium: true, premium_until: null };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<SettingsClient />);

    expect(screen.getByText(/Premium üyeliğiniz Süresiz tarihine kadar geçerli/)).toBeInTheDocument();
  });

  it('handles missing user profile gracefully', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: null });

    render(<SettingsClient />);

    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, loading: true });

    render(<SettingsClient />);

    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
  });

  it('initializes dark mode from localStorage', () => {
    const mockGetItem = jest.fn().mockReturnValue('dark');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: jest.fn(),
      },
      writable: true,
    });

    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    expect(mockGetItem).toHaveBeenCalledWith('theme');
  });

  it('saves theme preference to localStorage when toggled', () => {
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('light'),
        setItem: mockSetItem,
      },
      writable: true,
    });

    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<SettingsClient />);

    const darkModeToggle = screen.getByRole('button', { name: /enable dark mode/i });
    fireEvent.click(darkModeToggle);

    expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('handles subscription management error gracefully', async () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    // Mock window.open to throw error
    const mockOpen = jest.fn().mockImplementation(() => {
      throw new Error('Network error');
    });
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<SettingsClient />);

    const manageButton = screen.getByText('Aboneliği Yönet');
    fireEvent.click(manageButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error opening subscription management:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
}); 