import { z } from 'zod';

export const loginSchema = z.object({
  identifiant: z
    .string({ required_error: "L'identifiant est requis" })
    .min(1, "L'identifiant est requis")
    .max(255, "L'identifiant ne doit pas dépasser 255 caractères"),
  motDePasse: z
    .string({ required_error: 'Le mot de passe est requis' })
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Le refresh token est requis' })
    .min(1, 'Le refresh token est requis'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type RefreshTokenSchemaInput = z.infer<typeof refreshTokenSchema>;
export type LogoutSchemaInput = z.infer<typeof logoutSchema>;
