import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import DashboardPage from './page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/solid', () => ({
  AcademicCapIcon: () => <div data-testid="academic-cap-icon">🎓</div>,
  CheckCircleIcon: () => <div data-testid="check-circle-icon">✅</div>,
  FireIcon: () => <div data-testid="fire-icon">🔥</div>,
  ArrowPathIcon: () => <div data-testid="arrow-path-icon">🔄</div>,
  StarIcon: () => <div data-testid="star-icon">⭐</div>,
  DocumentTextIcon: () => <div data-testid="document-text-icon">📄</div>,
  BookmarkIcon: () => <div data-testid="bookmark-icon">🔖</div>,
  SparklesIcon: () => <div data-testid="sparkles-icon">✨</div>,
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('DashboardPage', () => {
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
  });

  const mockProfile = {
    id: '123',
    full_name: 'Test User',
    is_premium: false,
    premium_until: null,
  };

  const mockUser = {
    email: 'test@example.com',
    id: '123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  const defaultAuthState = {
    user: mockUser,
    profile: mockProfile,
    loading: false,
    signOut: jest.fn(),
    signInWithGoogle: jest.fn(),
    signUpWithGoogle: jest.fn(),
  };

  it('renders dashboard with user greeting', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText(/Merhaba, Test User/)).toBeInTheDocument();
    expect(screen.getByText(/Pratik yapmak mükemmelleştirir/)).toBeInTheDocument();
  });

  it('displays quiz limit for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/Bugün henüz quiz çözmedin, 1 quiz hakkın var!/)).toBeInTheDocument();
  });

  it('displays quiz limit for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<DashboardPage />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/Bugün 0 quiz çözdün, 5 tane daha çözebilirsin!/)).toBeInTheDocument();
  });

  it('shows premium upgrade CTA for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Premium\'a Geç')).toBeInTheDocument();
  });

  it('does not show premium upgrade CTA for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<DashboardPage />);

    expect(screen.queryByText('Premium\'a Geç')).not.toBeInTheDocument();
  });

  it('navigates to quiz creation with karma mode when Karma Quiz button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    const karmaButton = screen.getByText('Karma Quiz').closest('button');
    fireEvent.click(karmaButton!);

    expect(mockRouter.push).toHaveBeenCalledWith('/quiz/new?mode=karma');
  });

  it('navigates to quiz creation with zayif mode when Zayıf Konulardan Quiz button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    const weakSubjectsButton = screen.getByText('Zayıf Konulardan Quiz').closest('button');
    fireEvent.click(weakSubjectsButton!);

    expect(mockRouter.push).toHaveBeenCalledWith('/quiz/new?mode=zayif');
  });

  it('navigates to quiz creation with cikmis mode when Son Quiz\'e Devam Et button is clicked (no ongoing quiz)', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    const continueButton = screen.getByText('Çıkmış Sorulardan Quiz').closest('button');
    fireEvent.click(continueButton!);

    expect(mockRouter.push).toHaveBeenCalledWith('/quiz/new?mode=cikmis');
  });

  it('navigates to AI suggestion quiz when AI suggestion button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    const aiSuggestionButton = screen.getByText('Tavsiyeye Göre Quiz Oluştur');
    fireEvent.click(aiSuggestionButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/quiz/new?mode=karma&subjects=Fizyoloji');
  });

  it('shows streak badge for premium users with 3+ day streak', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(<DashboardPage />);

    expect(screen.getByText(/🔥 5 günlük seri!/)).toBeInTheDocument();
  });

  it('does not show streak badge for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.queryByText(/🔥 5 günlük seri!/)).not.toBeInTheDocument();
  });

  it('displays performance statistics', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('24')).toBeInTheDocument(); // Total quizzes
    expect(screen.getByText('78%')).toBeInTheDocument(); // Average score
    expect(screen.getByText('5 gün')).toBeInTheDocument(); // Streak
  });

  it('displays subject accuracy chart', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Konu Bazlı Doğruluk (Son 10 Quiz)')).toBeInTheDocument();
    expect(screen.getByText('Fizyoloji')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('displays weak and strong subjects', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Zayıf Konular')).toBeInTheDocument();
    expect(screen.getByText('Güçlü Konular')).toBeInTheDocument();
    expect(screen.getByText('Patoloji')).toBeInTheDocument();
    expect(screen.getByText('Farmakoloji')).toBeInTheDocument();
  });

  it('displays AI study tip', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('🤖 AI Tavsiyesi')).toBeInTheDocument();
    expect(screen.getByText(/Bu hafta Fizyoloji'ye odaklanmayı deneyin/)).toBeInTheDocument();
  });

  it('displays quiz history table', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Quiz Geçmişi')).toBeInTheDocument();
    expect(screen.getByText('Fizyoloji')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument(); // Score
    expect(screen.getByText('AI')).toBeInTheDocument(); // Type
  });

  it('displays notes section with tabs', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Notlarım')).toBeInTheDocument();
    expect(screen.getByText('AI Açıklamaları')).toBeInTheDocument();
    expect(screen.getByText('Asit-Baz Dengesi')).toBeInTheDocument();
  });

  it('displays leaderboard preview', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(<DashboardPage />);

    expect(screen.getByText('Sıralaman')).toBeInTheDocument();
    expect(screen.getByText(/Farmakoloji'de 4800 kullanıcı arasında 113. sıradasın!/)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, loading: true });

    render(<DashboardPage />);

    // Should still render but might show loading indicators
    expect(screen.getByText(/TusAI/)).toBeInTheDocument();
  });

  it('handles missing user profile gracefully', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: null });

    render(<DashboardPage />);

    expect(screen.getByText(/Merhaba, TusAI Kullanıcısı/)).toBeInTheDocument();
  });
}); 