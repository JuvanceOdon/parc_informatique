import { apiClient, extractData, extractList } from './client';
import type { ApiResponse, DashboardData, LoginResponse, Notification, User } from '../types';
import type {
  Materiel,
  MaterielHistoriqueEntry,
  TicketDetail,
  TicketHistoriqueEntry,
} from '../types/entities';

export const authApi = {
  login: async (identifiant: string, motDePasse: string) =>
    extractData(
      await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { identifiant, motDePasse }),
    ),

  logout: async (refreshToken?: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  profile: async () => extractData(await apiClient.get<ApiResponse<User>>('/auth/profile')),
};

export const dashboardApi = {
  get: async (months = 12) =>
    extractData(await apiClient.get<ApiResponse<DashboardData>>('/dashboard', { params: { months } })),
};

export const notificationsApi = {
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<Notification[]>>('/notifications', { params })),
  unreadCount: async () =>
    extractData(await apiClient.get<ApiResponse<{ count: number }>>('/notifications/non-lues/count')),
  markAsRead: async (id: number) => apiClient.patch(`/notifications/${id}/lire`),
  markAllAsRead: async () => apiClient.patch('/notifications/lire-toutes'),
};

const crud = (base: string) => ({
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<unknown[]>>(base, { params })),
  get: async (id: number) => extractData(await apiClient.get<ApiResponse<unknown>>(`${base}/${id}`)),
  create: async (body: unknown) => extractData(await apiClient.post<ApiResponse<unknown>>(base, body)),
  update: async (id: number, body: unknown) =>
    extractData(await apiClient.put<ApiResponse<unknown>>(`${base}/${id}`, body)),
  remove: async (id: number) => apiClient.delete(`${base}/${id}`),
});

export const utilisateursApi = {
  ...crud('/utilisateurs'),
  deactivate: async (id: number) => apiClient.patch(`/utilisateurs/${id}/desactiver`),
  activate: async (id: number) => apiClient.patch(`/utilisateurs/${id}/activer`),
};

export const servicesApi = {
  ...crud('/services'),
  deactivate: async (id: number) => apiClient.patch(`/services/${id}/desactiver`),
  activate: async (id: number) => apiClient.patch(`/services/${id}/activer`),
};

export const categoriesApi = crud('/categories');
export const materielsApi = {
  ...crud('/materiels'),
  deactivate: async (id: number) => apiClient.patch(`/materiels/${id}/desactiver`),
  getById: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<Materiel>>(`/materiels/${id}`)),
  getHistorique: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<MaterielHistoriqueEntry[]>>(`/materiels/${id}/historique`)),
};

export const affectationsApi = {
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<unknown[]>>('/affectations', { params })),
  get: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<import('../types/entities').Affectation>>(`/affectations/${id}`)),
  create: async (body: unknown) =>
    extractData(await apiClient.post<ApiResponse<unknown>>('/affectations', body)),
  update: async (id: number, body: unknown) =>
    extractData(await apiClient.put<ApiResponse<unknown>>(`/affectations/${id}`, body)),
  transfer: async (id: number, body: unknown) =>
    extractData(await apiClient.post<ApiResponse<unknown>>(`/affectations/${id}/transfert`, body)),
  terminer: async (id: number, body?: unknown) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/affectations/${id}/terminer`, body ?? {})),
};

export const ticketsApi = {
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<unknown[]>>('/tickets', { params })),
  get: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<TicketDetail>>(`/tickets/${id}`)),
  getHistorique: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<TicketHistoriqueEntry[]>>(`/tickets/${id}/historique`)),
  create: async (body: unknown) => extractData(await apiClient.post<ApiResponse<unknown>>('/tickets', body)),
  update: async (id: number, body: unknown) =>
    extractData(await apiClient.put<ApiResponse<unknown>>(`/tickets/${id}`, body)),
  changeStatut: async (id: number, body: { statut: string; commentaire?: string | null }) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/tickets/${id}/statut`, body)),
  changePriorite: async (id: number, body: { priorite: string }) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/tickets/${id}/priorite`, body)),
  addCommentaire: async (id: number, contenu: string) =>
    extractData(await apiClient.post<ApiResponse<unknown>>(`/tickets/${id}/commentaires`, { contenu })),
};

export const maintenancesApi = {
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<unknown[]>>('/maintenances', { params })),
  get: async (id: number) =>
    extractData(await apiClient.get<ApiResponse<import('../types/entities').Maintenance>>(`/maintenances/${id}`)),
  create: async (body: unknown) =>
    extractData(await apiClient.post<ApiResponse<unknown>>('/maintenances', body)),
  update: async (id: number, body: unknown) =>
    extractData(await apiClient.put<ApiResponse<unknown>>(`/maintenances/${id}`, body)),
  remove: async (id: number) => apiClient.delete(`/maintenances/${id}`),
  demarrer: async (id: number) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/maintenances/${id}/demarrer`)),
  enregistrerDiagnostic: async (id: number, body: { diagnostic: string }) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/maintenances/${id}/diagnostic`, body)),
  enregistrerSolution: async (id: number, body: { solution: string; cout?: number | null }) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/maintenances/${id}/solution`, body)),
  annuler: async (id: number, body?: { motif?: string | null }) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/maintenances/${id}/annuler`, body ?? {})),
  reprendre: async (id: number) =>
    extractData(await apiClient.patch<ApiResponse<unknown>>(`/maintenances/${id}/reprendre`)),
};

export const journalAuditApi = {
  list: async (params?: Record<string, unknown>) =>
    extractList(await apiClient.get<ApiResponse<unknown[]>>('/journal-audit', { params })),
};

const parseBlobError = async (data: Blob): Promise<never> => {
  const text = await data.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    throw new Error(json.message ?? 'Erreur lors du téléchargement');
  } catch (err) {
    if (err instanceof Error && err.message !== text) throw err;
    throw new Error('Fichier reçu invalide');
  }
};

export const downloadReport = async (
  path: string,
  params: Record<string, unknown>,
): Promise<void> => {
  const response = await apiClient.get<ArrayBuffer>(path, {
    params,
    responseType: 'arraybuffer',
    transformResponse: [(data) => data],
  });

  const contentType = (response.headers['content-type'] as string | undefined)?.split(';')[0]?.trim();
  if (contentType?.includes('application/json')) {
    const text = new TextDecoder().decode(response.data);
    const json = JSON.parse(text) as { message?: string };
    throw new Error(json.message ?? 'Erreur lors du téléchargement');
  }

  const mime =
    contentType ??
    (params.format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf');

  const blob = new Blob([response.data], { type: mime });
  if (blob.size < 50) {
    await parseBlobError(blob);
  }

  const disposition = response.headers['content-disposition'] as string | undefined;
  const filenameMatch = disposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? (params.format === 'excel' ? 'rapport.xlsx' : 'rapport.pdf');

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
