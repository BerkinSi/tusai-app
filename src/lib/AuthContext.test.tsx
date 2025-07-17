import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

function TestComponent() {
  const { user, profile, loading } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? 'yes' : 'no'}</span>
      <span data-testid="profile">{profile ? 'yes' : 'no'}</span>
      <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
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
    // loading may be true or false depending on async, so just check it renders
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('throws if useAuth is used outside provider', () => {
    // Suppress error output for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    spy.mockRestore();
  });
}); 