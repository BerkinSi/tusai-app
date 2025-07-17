import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureGate from './FeatureGate';
import React from 'react';

// Mock useAuth
jest.mock('./AuthContext', () => ({
  useAuth: () => ({ profile: { is_premium: false }, loading: false })
}));

describe('FeatureGate', () => {
  it('shows upgrade modal for non-premium', () => {
    render(<FeatureGate premium><div>Premium Content</div></FeatureGate>);
    fireEvent.click(screen.getByText(/Premium Özellik/i));
    expect(screen.getByText(/Premium Gerekli/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium’a Geç/i)).toBeInTheDocument();
  });

  it('renders children for premium', () => {
    jest.mocked(require('./AuthContext').useAuth).mockReturnValue({ profile: { is_premium: true }, loading: false });
    render(<FeatureGate premium><div>Premium Content</div></FeatureGate>);
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('renders children if not premium required', () => {
    render(<FeatureGate><div>Free Content</div></FeatureGate>);
    expect(screen.getByText('Free Content')).toBeInTheDocument();
  });
}); 