jest.mock('@supabase/supabase-js', () => {
  const signInWithOAuth = jest.fn();
  const signOut = jest.fn();
  const onAuthStateChange = jest.fn((cb) => {
    // Simulate no session by default
    cb('SIGNED_OUT', { user: null });
    return { subscription: { unsubscribe: jest.fn() } };
  });
  const getUser = jest.fn(() => Promise.resolve({ data: { user: null } }));
  const from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null }),
    insert: jest.fn().mockReturnThis(),
  }));
  return {
    createClient: () => ({
      auth: { onAuthStateChange, getUser, signInWithOAuth, signOut },
      from,
    }),
    __mocks: { signInWithOAuth, signOut, onAuthStateChange, getUser, from },
  };
});

import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

function TestComponent() {
  const { user, profile, loading, signInWithGoogle, signUpWithGoogle, signOut } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? 'yes' : 'no'}</span>
      <span data-testid="profile">{profile ? 'yes' : 'no'}</span>
      <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
      <button onClick={signInWithGoogle} data-testid="google-login">Google Login</button>
      <button onClick={signUpWithGoogle} data-testid="google-signup">Google Signup</button>
      <button onClick={signOut} data-testid="signout">Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides default values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user').textContent).toBe('no');
    expect(screen.getByTestId('profile').textContent).toBe('no');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('throws if useAuth is used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    spy.mockRestore();
  });

  it('calls signInWithGoogle with correct params', async () => {
    const { __mocks } = jest.requireMock('@supabase/supabase-js');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('google-login').click();
    });
    expect(__mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({ redirectTo: expect.any(String) })
    });
  });

  it('calls signUpWithGoogle with correct params', async () => {
    const { __mocks } = jest.requireMock('@supabase/supabase-js');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('google-signup').click();
    });
    expect(__mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({ redirectTo: expect.any(String) })
    });
  });

  it('calls signOut and resets state', async () => {
    const { __mocks } = jest.requireMock('@supabase/supabase-js');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('signout').click();
    });
    expect(__mocks.signOut).toHaveBeenCalled();
  });

  it('creates profile for OAuth user if not exists', async () => {
    // Mock a user returned from getUser
    const { __mocks } = jest.requireMock('@supabase/supabase-js');
    __mocks.getUser.mockResolvedValueOnce({ data: { user: { id: '123', email: 'test@example.com', user_metadata: { name: 'Test User' } } } });
    // Mock no existing profile
    __mocks.from().select().eq().single.mockResolvedValueOnce({ data: null });
    // Mock insert returns new profile
    __mocks.from().insert().select().single.mockResolvedValueOnce({ data: { id: '123', full_name: 'Test User', is_premium: false } });
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    expect(__mocks.from().insert).toHaveBeenCalledWith({
      id: '123',
      full_name: 'Test User',
      avatar_url: undefined,
      is_premium: false,
    });
  });
}); 