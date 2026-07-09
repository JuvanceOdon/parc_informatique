import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Matériels" subtitle="Inventaire" />);
    expect(screen.getByText('Matériels')).toBeInTheDocument();
    expect(screen.getByText('Inventaire')).toBeInTheDocument();
  });

  it('renders optional action', () => {
    render(<PageHeader title="Tickets" action={<button type="button">Ajouter</button>} />);
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });
});
