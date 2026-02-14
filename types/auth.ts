export type UserRole = "admin" | "finance" | "viewer";

export const ROLES: Record<UserRole, string> = {
  admin: "Admin",
  finance: "Finance",
  viewer: "Viewer",
};
