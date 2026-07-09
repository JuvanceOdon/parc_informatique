import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/common.validation.js';

const matriculeSchema = z
  .string({ required_error: 'Le matricule est requis' })
  .min(3, 'Le matricule doit contenir au moins 3 caractères')
  .max(50, 'Le matricule ne doit pas dépasser 50 caractères')
  .regex(/^[A-Za-z0-9_-]+$/, 'Le matricule contient des caractères invalides');

const emailSchema = z
  .string({ required_error: "L'email est requis" })
  .email('Email invalide')
  .max(255, "L'email ne doit pas dépasser 255 caractères");

const passwordSchema = z
  .string({ required_error: 'Le mot de passe est requis' })
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères');

const nomSchema = z
  .string({ required_error: 'Le nom est requis' })
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom ne doit pas dépasser 100 caractères');

const prenomSchema = z
  .string({ required_error: 'Le prénom est requis' })
  .min(2, 'Le prénom doit contenir au moins 2 caractères')
  .max(100, 'Le prénom ne doit pas dépasser 100 caractères');

const telephoneSchema = z
  .string()
  .max(20, 'Le téléphone ne doit pas dépasser 20 caractères')
  .nullable()
  .optional();

export const createUtilisateurSchema = z.object({
  matricule: matriculeSchema,
  email: emailSchema,
  motDePasse: passwordSchema,
  nom: nomSchema,
  prenom: prenomSchema,
  telephone: telephoneSchema,
  roleId: z.coerce.number().int().positive('Le rôle est invalide'),
  serviceId: z.coerce.number().int().positive().nullable().optional(),
});

export const updateUtilisateurSchema = z
  .object({
    matricule: matriculeSchema.optional(),
    email: emailSchema.optional(),
    motDePasse: passwordSchema.optional(),
    nom: nomSchema.optional(),
    prenom: prenomSchema.optional(),
    telephone: telephoneSchema,
    roleId: z.coerce.number().int().positive('Le rôle est invalide').optional(),
    serviceId: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const assignRoleSchema = z.object({
  roleId: z.coerce.number().int().positive('Le rôle est invalide'),
});

export const listUtilisateursQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  actif: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  roleId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['nom', 'prenom', 'email', 'matricule', 'createdAt']).default('createdAt'),
});

export type CreateUtilisateurSchemaInput = z.infer<typeof createUtilisateurSchema>;
export type UpdateUtilisateurSchemaInput = z.infer<typeof updateUtilisateurSchema>;
export type AssignRoleSchemaInput = z.infer<typeof assignRoleSchema>;
export type ListUtilisateursQueryInput = z.infer<typeof listUtilisateursQuerySchema>;
