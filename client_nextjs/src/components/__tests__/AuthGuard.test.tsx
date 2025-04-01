import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthGuard from '../AuthGuard';
import { useUserStore } from '../../globalState/user';

jest.mock('../../globalState/user');

describe('AuthGuard', () => {
  const mockUseUserStore = useUserStore as unknown as jest.Mock;

  beforeEach(() => {
    mockUseUserStore.mockClear();
  });

  it('renders children when user is authenticated', () => {
    mockUseUserStore.mockReturnValue({ auth: { access_token: 'test-token' } });
    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected</div>
      </AuthGuard>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders Home page when user is not authenticated', () => {
    mockUseUserStore.mockReturnValue({ auth: null });
    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected</div>
      </AuthGuard>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Public Home Page')).toBeInTheDocument();
  });

  it('renders Home page when auth is undefined', () => {
    mockUseUserStore.mockReturnValue({ auth: undefined });
    render(
      <AuthGuard>
        <span>Secret</span>
      </AuthGuard>
    );
    expect(screen.getByText('Public Home Page')).toBeInTheDocument();
  });
});
