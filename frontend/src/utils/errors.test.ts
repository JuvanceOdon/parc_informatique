import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns axios validation errors joined', () => {
    const error = new axios.AxiosError('fail');
    error.response = {
      data: { errors: [{ message: 'Email invalide' }, { message: 'Champ requis' }] },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    };
    expect(getErrorMessage(error)).toBe('Email invalide, Champ requis');
  });

  it('returns axios message when present', () => {
    const error = new axios.AxiosError('fail');
    error.response = {
      data: { message: 'Non autorisé' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    };
    expect(getErrorMessage(error)).toBe('Non autorisé');
  });

  it('returns fallback for unknown errors', () => {
    expect(getErrorMessage({}, 'Erreur par défaut')).toBe('Erreur par défaut');
  });
});
