export { login, logout, getCurrentUser, hasRole } from './auth-service';
export { AuthProvider, useAuth } from './auth-provider';
export { detectRoles, buildUser, getPrimaryRoleLabel } from './utils';
export type { AuthContextType } from './auth-provider';