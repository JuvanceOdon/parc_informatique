import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback = 'Une erreur est survenue'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message: string }> }
      | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(', ');
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
