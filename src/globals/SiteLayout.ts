import type { Field, GlobalConfig } from "payload";
import { isStaff } from "@/access";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { linkField } from "@/fields/link";
import { revalidateGlobal } from "@/hooks/revalidate";

const hidden: Field = { name: "hidden", type: "checkbox", label: "Скрыть на сайте", defaultValue: false };

export const SiteLayout: GlobalConfig = {
  slug: "site-layout",
  label: "Шапка и подвал",
  admin: {
    group: "Структура сайта",
    description: "Логотип, надпись в шапке, красная кнопка, соцсети и ссылки в подвале. Пункты меню задаются в «Страницы сайта».",
  },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Логотип и шапка",
          fields: [
            { name: "showLogo", type: "checkbox", label: "Показывать логотип", defaultValue: true },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              label: "Логотип",
              admin: {
                condition: (data) => data?.showLogo !== false,
                description: "Если пусто, показывается герб ФРСРК. Лучше PNG или WebP с прозрачным фоном, высотой от 300 px.",
              },
            },
            {
              name: "showName",
              type: "checkbox",
              label: "Показывать название федерации рядом с логотипом",
              defaultValue: true,
              admin: { description: "Само название меняется в «Система → Данные федерации»." },
            },
            {
              name: "slogan",
              type: "text",
              label: "Надпись справа в шапке",
              defaultValue: "Сила в движении!",
              admin: { description: "Если пусто, надписи нет." },
            },
          ],
        },
        {
          label: "Красная кнопка",
          fields: [
            {
              name: "cta",
              type: "group",
              label: "Красная кнопка справа",
              fields: [
                { name: "show", type: "checkbox", label: "Показывать кнопку", defaultValue: true },
                { name: "label", type: "text", label: "Надпись", defaultValue: "Найти секцию" },
                linkField(),
              ],
            },
          ],
        },
        {
          label: "Соцсети",
          fields: [
            {
              name: "socials",
              type: "array",
              label: "Соцсети и мессенджеры",
              labels: { singular: "Соцсеть", plural: "Соцсети" },
              admin: {
                description: "Значки в шапке, в мобильном меню и на странице «Контакты».",
                components: { RowLabel: "@/components/admin/RowLabel#RowLabel" },
              },
              fields: [
                { name: "network", type: "select", label: "Соцсеть", required: true, defaultValue: "vk", options: SOCIAL_NETWORKS.map(({ value, label }) => ({ value, label })) },
                { name: "label", type: "text", label: "Подпись", admin: { description: "Например, «Сообщество федерации». Показывается на странице «Контакты» и читается программами для незрячих." } },
                { name: "url", type: "text", label: "Ссылка", required: true },
                {
                  name: "icon",
                  type: "upload",
                  relationTo: "media",
                  label: "Своя иконка",
                  admin: { condition: (_, sibling) => sibling?.network === "other", description: "Квадратная картинка PNG, WebP или SVG. Если пусто, будет значок ссылки." },
                },
                hidden,
              ],
            },
          ],
        },
        {
          label: "Подвал",
          fields: [
            {
              name: "footerColumns",
              type: "array",
              label: "Колонки ссылок в подвале",
              labels: { singular: "Колонка", plural: "Колонки" },
              admin: { initCollapsed: true, components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
              fields: [
                { name: "title", type: "text", label: "Заголовок колонки", required: true },
                hidden,
                {
                  name: "links",
                  type: "array",
                  label: "Ссылки",
                  labels: { singular: "Ссылка", plural: "Ссылки" },
                  admin: { initCollapsed: true, components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
                  fields: [{ name: "label", type: "text", label: "Название", required: true }, linkField(), hidden],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
