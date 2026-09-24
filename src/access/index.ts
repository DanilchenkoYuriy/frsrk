import type { Access, FieldAccess, Where } from "payload";

type Role = "admin" | "editor";

interface AuthUser {
  id: number | string;
  role?: Role;
}

const roleOf = (user: unknown): Role | null => {
  const role = (user as AuthUser | null)?.role;
  return role === "admin" || role === "editor" ? role : null;
};

/** Только администратор. */
export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === "admin";

/** Администратор или редактор (любой вошедший сотрудник). */
export const isStaff: Access = ({ req: { user } }) => roleOf(user) !== null;

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === "admin";

/** Запрещено всем: запись только через сервер (локальный API). */
export const nobody: Access = () => false;

/**
 * Чтение: сотрудники видят всё, посетители — только записи с включённой публикацией.
 */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (roleOf(user)) return true;
  const where: Where = { published: { equals: true } };
  return where;
};

/** Пользователи: администратор видит всех, редактор — только себя. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  const role = roleOf(user);
  if (role === "admin") return true;
  if (role === "editor" && user) return { id: { equals: (user as AuthUser).id } };
  return false;
};
