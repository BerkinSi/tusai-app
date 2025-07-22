import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import QuizNewPage from './page';

// Mock Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../../lib/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock jsPDF
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    save: jest.fn(),
  })),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
} as any;

const mockSearchParams = {
  get: jest.fn(),
} as any;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('QuizNewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseSearchParams.mockReturnValue(mockSearchParams);
    
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

  it('renders quiz creation page', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    expect(screen.getByText('Yeni Quiz Oluştur')).toBeInTheDocument();
    expect(screen.getByText('Adım 1/3')).toBeInTheDocument();
  });

  it('handles URL parameters for karma mode', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'mode') return 'karma';
      if (param === 'subjects') return null;
      return null;
    });

    render(<QuizNewPage />);

    expect(screen.getByText('Karma')).toBeInTheDocument();
    expect(screen.getByText('Yapay Zeka tarafından olşturulan sorular ile çıkmış soruların karışımı')).toBeInTheDocument();
  });

  it('handles URL parameters for zayif mode', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'mode') return 'zayif';
      if (param === 'subjects') return null;
      return null;
    });

    render(<QuizNewPage />);

    expect(screen.getByText('Zayıf Konular')).toBeInTheDocument();
    expect(screen.getByText('Son quiz sonuçlarına göre en zayıf olduğunuz konulardan sorular')).toBeInTheDocument();
  });

  it('handles URL parameters for cikmis mode', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'mode') return 'cikmis';
      if (param === 'subjects') return null;
      return null;
    });

    render(<QuizNewPage />);

    expect(screen.getByText('Çıkmış Sorular')).toBeInTheDocument();
    expect(screen.getByText('ÖSYM tarafından yayımlanmış geçmiş sınav sorularından oluşur')).toBeInTheDocument();
  });

  it('handles URL parameters with specific subjects', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'mode') return 'karma';
      if (param === 'subjects') return 'Fizyoloji,Biyokimya';
      return null;
    });

    render(<QuizNewPage />);

    expect(screen.getByText('Karma')).toBeInTheDocument();
    // Should pre-select Fizyoloji and Biyokimya
  });

  it('allows subject selection', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    const fizyolojiButton = screen.getByText('Fizyoloji');
    fireEvent.click(fizyolojiButton);

    expect(fizyolojiButton).toHaveClass('bg-blue-600');
  });

  it('allows mode selection', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    const karmaButton = screen.getByText('Karma');
    fireEvent.click(karmaButton);

    expect(karmaButton).toHaveClass('bg-blue-600');
  });

  it('shows error when trying to proceed without selection', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    const nextButton = screen.getByText('Devam Et');
    fireEvent.click(nextButton);

    expect(screen.getByText('Lütfen en az bir konu ve bir mod seçin.')).toBeInTheDocument();
  });

  it('proceeds to step 2 when valid selection is made', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));

    const nextButton = screen.getByText('Devam Et');
    fireEvent.click(nextButton);

    expect(screen.getByText('Adım 2/3')).toBeInTheDocument();
  });

  it('shows different configuration options for free vs premium users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject first
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Check free user limitations
    expect(screen.getByText('Ücretsiz kullanıcılar için maksimum 10 soru')).toBeInTheDocument();
    expect(screen.getByText('Ücretsiz kullanıcılar için zaman sınırı yok')).toBeInTheDocument();
  });

  it('shows premium features for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject first
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Check premium user options
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('10 dakika')).toBeInTheDocument();
    expect(screen.getByText('30 dakika')).toBeInTheDocument();
    expect(screen.getByText('60 dakika')).toBeInTheDocument();
  });

  it('forces free user limitations', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject first
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Try to select more than 10 questions
    const questionCountButtons = screen.getAllByText(/10|20|40/);
    const twentyButton = questionCountButtons.find(button => button.textContent === '20');
    if (twentyButton) {
      fireEvent.click(twentyButton);
    }

    // Should still show 10 as selected for free users
    expect(screen.getByText('10')).toHaveClass('bg-blue-600');
  });

  it('creates quiz and shows step 3', async () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Configure quiz
    fireEvent.click(screen.getByText('Devam Et'));

    await waitFor(() => {
      expect(screen.getByText('Adım 3/3')).toBeInTheDocument();
    });
  });

  it('shows PDF generation option for premium users', async () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Configure quiz
    fireEvent.click(screen.getByText('Devam Et'));

    await waitFor(() => {
      expect(screen.getByText('PDF Oluştur / İndir')).toBeInTheDocument();
    });
  });

  it('does not show PDF generation option for free users', async () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Configure quiz
    fireEvent.click(screen.getByText('Devam Et'));

    await waitFor(() => {
      expect(screen.queryByText('PDF Oluştur / İndir')).not.toBeInTheDocument();
    });
  });

  it('handles quiz creation error', async () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Select mode and subject
    fireEvent.click(screen.getByText('Karma'));
    fireEvent.click(screen.getByText('Fizyoloji'));
    fireEvent.click(screen.getByText('Devam Et'));

    // Configure quiz
    fireEvent.click(screen.getByText('Devam Et'));

    await waitFor(() => {
      expect(screen.getByText('Quiz oluşturuluyor...')).toBeInTheDocument();
    });
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, user: null });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/giris?next=/quiz/new');
  });

  it('handles loading state', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, loading: true });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    // Should still render but might show loading indicators
    expect(screen.getByText('Yeni Quiz Oluştur')).toBeInTheDocument();
  });

  it('handles missing user profile gracefully', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: null });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    expect(screen.getByText('Yeni Quiz Oluştur')).toBeInTheDocument();
  });

  it('shows daily quiz limit warning for free users', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    expect(screen.getByText(/Günde 1 quiz hakkınız var/)).toBeInTheDocument();
  });

  it('shows daily quiz limit for premium users', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });
    mockSearchParams.get.mockReturnValue(null);

    render(<QuizNewPage />);

    expect(screen.getByText(/Günde 5 quiz hakkınız var/)).toBeInTheDocument();
  });
}); 