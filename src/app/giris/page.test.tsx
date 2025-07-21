import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GirisPage from './page';
import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

jest.mock('../../lib/AuthContext', () => {
  return {
    useAuth: jest.fn(() => ({
      signInWithGoogle: jest.fn(() => Promise.resolve()),
    })),
  };
});

jest.mock('../../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
      },
    },
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('GirisPage', () => {
  it('renders login form and Google button', () => {
    render(<GirisPage />);
    expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google ile Giriş Yap/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it('calls Supabase on email/password login', async () => {
    render(<GirisPage />);
    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'password123' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
  });

  it('shows error on failed login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: { message: 'fail' } });
    render(<GirisPage />);
    fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'wrong' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));
    });
    expect(await screen.findByText(/Giriş başarısız/i)).toBeInTheDocument();
  });

  it('calls signInWithGoogle on Google button click', async () => {
    render(<GirisPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Google ile Giriş Yap/i }));
    });
    expect(useAuth().signInWithGoogle).toHaveBeenCalled();
  });
}); 