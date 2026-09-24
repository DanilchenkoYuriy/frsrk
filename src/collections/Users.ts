import type { CollectionConfig } from "payload";
import { adminOrSelf, isAdmin, isAdminField } from "@/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Сотрудник", plural: "Сотрудники" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Система",
    description: "Люди, которые могут входить в админку. Добавлять и удалять сотрудников может только администратор.",
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Первый зарегистрированный пользователь всегда становится администратором.
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
          if (totalDocs === 0) return { ...data, role: "admin" };
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Имя", required: true },
    {
      name: "role",
      type: "select",
      label: "Роль",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Администратор (всё, включая сотрудников)", value: "admin" },
        { label: "Редактор (содержимое сайта)", value: "editor" },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: { description: "Первый созданный сотрудник всегда становится администратором. Остальным роль выбирает администратор." },
    },
  ],
};
