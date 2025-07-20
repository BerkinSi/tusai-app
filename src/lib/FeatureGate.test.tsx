import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureGate from './FeatureGate';
import React from 'react';

// Default mock for useAuth (non-premium)
jest.mock('./AuthContext', () => ({
  useAuth: () => ({ profile: { is_premium: false }, loading: false })
}));

import { useAuth } from './AuthContext';

describe('FeatureGate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows upgrade modal for non-premium', () => {
    render(<FeatureGate premium><div>Premium Content</div></FeatureGate>);
    fireEvent.click(screen.getByText(/Premium Özellik/i));
    expect(screen.getByText(/Premium Gerekli/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium’a Geç/i)).toBeInTheDocument();
  });

  it('renders children for premium', () => {
    const mockUseAuth = jest.spyOn(require('./AuthContext'), 'useAuth');
    mockUseAuth.mockReturnValue({ profile: { is_premium: true }, loading: false });
    render(<FeatureGate premium><div>Premium Content</div></FeatureGate>);
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('renders children if not premium required', () => {
    render(<FeatureGate><div>Free Content</div></FeatureGate>);
    expect(screen.getByText('Free Content')).toBeInTheDocument();
  });
}); 