import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from './AuthContext';
import FeatureGate from './FeatureGate';

// Mock AuthContext
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('FeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('renders children when premium is false and user is not premium', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={false}>
        <div>Free content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Free content')).toBeInTheDocument();
  });

  it('renders children when premium is true and user is premium', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Premium content')).toBeInTheDocument();
  });

  it('shows upgrade button when premium is true and user is not premium', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Premium Özellik – Yükselt')).toBeInTheDocument();
    expect(screen.queryByText('Premium content')).not.toBeInTheDocument();
  });

  it('opens modal when upgrade button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    const upgradeButton = screen.getByText('Premium Özellik – Yükselt');
    fireEvent.click(upgradeButton);

    expect(screen.getByText('Premium Gerekli')).toBeInTheDocument();
    expect(screen.getByText('Bu özelliği kullanmak için Premium üyelik gereklidir.')).toBeInTheDocument();
  });

  it('shows upgrade CTA in modal', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    const upgradeButton = screen.getByText('Premium Özellik – Yükselt');
    fireEvent.click(upgradeButton);

    expect(screen.getByText(/Premium'a Geç/)).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    const upgradeButton = screen.getByText('Premium Özellik – Yükselt');
    fireEvent.click(upgradeButton);

    expect(screen.getByText('Premium Gerekli')).toBeInTheDocument();

    const closeButton = screen.getByText('Kapat');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Premium Gerekli')).not.toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, loading: true });

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    // Should render nothing when loading
    expect(screen.queryByText('Premium content')).not.toBeInTheDocument();
    expect(screen.queryByText('Premium Özellik – Yükselt')).not.toBeInTheDocument();
  });

  it('handles missing user profile gracefully', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: null });

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Premium Özellik – Yükselt')).toBeInTheDocument();
  });

  it('handles missing user', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthState, user: null });

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Premium Özellik – Yükselt')).toBeInTheDocument();
  });

  it('renders children when premium is not specified', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate>
        <div>Default content</div>
      </FeatureGate>
    );

    expect(screen.getByText('Default content')).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={false}>
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </FeatureGate>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });

  it('handles complex JSX children', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={false}>
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </FeatureGate>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('shows upgrade button with correct styling', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    const upgradeButton = screen.getByText('Premium Özellik – Yükselt');
    expect(upgradeButton).toHaveClass('bg-tusai');
    expect(upgradeButton).toHaveClass('hover:bg-tusai-accent');
  });

  it('shows modal with correct styling', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>Premium content</div>
      </FeatureGate>
    );

    const upgradeButton = screen.getByText('Premium Özellik – Yükselt');
    fireEvent.click(upgradeButton);

    // Check for modal overlay
    const modalOverlay = screen.getByText('Premium Gerekli').closest('div')?.parentElement;
    expect(modalOverlay).toHaveClass('fixed');
    expect(modalOverlay).toHaveClass('inset-0');
    expect(modalOverlay).toHaveClass('z-50');
  });

  it('handles premium feature with dynamic content', () => {
    const premiumProfile = { ...mockProfile, is_premium: true };
    mockUseAuth.mockReturnValue({ ...defaultAuthState, profile: premiumProfile });

    render(
      <FeatureGate premium={true}>
        <div data-testid="premium-feature">
          <span>Dynamic content for {mockProfile.full_name}</span>
        </div>
      </FeatureGate>
    );

    expect(screen.getByText('Dynamic content for Test User')).toBeInTheDocument();
  });

  it('handles conditional rendering based on premium status', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={true}>
        <div>This should not show</div>
      </FeatureGate>
    );

    expect(screen.queryByText('This should not show')).not.toBeInTheDocument();
    expect(screen.getByText('Premium Özellik – Yükselt')).toBeInTheDocument();
  });

  it('handles nested FeatureGate components', () => {
    mockUseAuth.mockReturnValue(defaultAuthState);

    render(
      <FeatureGate premium={false}>
        <div>Free content</div>
        <FeatureGate premium={true}>
          <div>Nested premium content</div>
        </FeatureGate>
      </FeatureGate>
    );

    expect(screen.getByText('Free content')).toBeInTheDocument();
    expect(screen.getByText('Premium Özellik – Yükselt')).toBeInTheDocument();
    expect(screen.queryByText('Nested premium content')).not.toBeInTheDocument();
  });
}); 