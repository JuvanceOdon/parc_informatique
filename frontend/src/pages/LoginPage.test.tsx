import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeModeProvider } from '../contexts/ThemeModeContext';
import { LoginPage } from './LoginPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
    isStaff: false,
  }),
}));

describe('LoginPage', () => {
  it('renders login form fields', () => {
    render(
      <ThemeModeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeModeProvider>,
    );

    expect(screen.getByRole('textbox', { name: /Identifiant \/ Matricule/i })).toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });
});
