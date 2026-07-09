export enum RoleCode {
  ADMIN = 'ADMIN',
  CHEF_SERVICE = 'CHEF_SERVICE',
  TECHNICIEN = 'TECHNICIEN',
  UTILISATEUR = 'UTILISATEUR',
}

export const ROLE_LABELS: Record<RoleCode, string> = {
  [RoleCode.ADMIN]: 'Administrateur',
  [RoleCode.CHEF_SERVICE]: 'Chef de service',
  [RoleCode.TECHNICIEN]: 'Technicien',
  [RoleCode.UTILISATEUR]: 'Utilisateur',
};

export const ALL_ROLE_CODES = Object.values(RoleCode);
