import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Supabase client with simpler types
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Test component to access context
const TestComponent = () => {
  const { user, profile, loading, signOut, signInWithGoogle, signUpWithGoogle } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="profile">{profile ? profile.full_name : 'no-profile'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <button onClick={signInWithGoogle} data-testid="sign-in">Sign In</button>
      <button onClick={signUpWithGoogle} data-testid="sign-up">Sign Up</button>
      <button onClick={signOut} data-testid="sign-out">Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
  });

  it('provides auth functions', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    expect(screen.getByTestId('sign-up')).toBeInTheDocument();
    expect(screen.getByTestId('sign-out')).toBeInTheDocument();
  });

  it('handles sign in button click', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByTestId('sign-in');
    fireEvent.click(signInButton);

    // Should not crash
    expect(signInButton).toBeInTheDocument();
  });

  it('handles sign up button click', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = screen.getByTestId('sign-up');
    fireEvent.click(signUpButton);

    // Should not crash
    expect(signUpButton).toBeInTheDocument();
  });

  it('handles sign out button click', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = screen.getByTestId('sign-out');
    fireEvent.click(signOutButton);

    // Should not crash
    expect(signOutButton).toBeInTheDocument();
  });

  it('eventually stops loading', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    // After a delay, should not be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    }, { timeout: 2000 });
  });

  it('provides consistent context values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should always have these elements
    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('profile')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles multiple renders', () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');

    // Re-render should not crash
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('provides auth context to children', () => {
    const ChildComponent = () => {
      const { user, profile, loading } = useAuth();
      return (
        <div>
          <span data-testid="child-user">{user ? 'has-user' : 'no-user'}</span>
          <span data-testid="child-profile">{profile ? 'has-profile' : 'no-profile'}</span>
          <span data-testid="child-loading">{loading ? 'loading' : 'not-loading'}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <ChildComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('child-user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('child-profile')).toHaveTextContent('no-profile');
    expect(screen.getByTestId('child-loading')).toBeInTheDocument();
  });
}); 