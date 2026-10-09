import type { Field, GlobalConfig } from "payload";
import { isStaff } from "@/access";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { linkField } from "@/fields/link";
import { revalidateGlobal } from "@/hooks/revalidate";

const hidden: Field = { name: "hidden", type: "checkbox", label: "Скрыть на сайте", defaultValue: false };

export const SiteLayout: GlobalConfig = {
  slug: "site-layout",
  label: "Шапка, меню, главная и подвал",
  admin: {
    group: "Структура сайта",
    description: "Логотип, верхнее меню, красная кнопка, соцсети, мероприятия на главной и ссылки в подвале. Пункты можно добавлять, скрывать, удалять и перетаскивать мышью.",
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
          label: "Меню",
          fields: [
            {
              name: "menu",
              type: "array",
              label: "Пункты верхнего меню",
              labels: { singular: "Пункт", plural: "Пункты" },
              admin: { initCollapsed: true, components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
              fields: [
                { name: "label", type: "text", label: "Название", required: true },
                linkField(),
                hidden,
                {
                  name: "children",
                  type: "array",
                  label: "Подпункты (выпадающий список)",
                  labels: { singular: "Подпункт", plural: "Подпункты" },
                  admin: { initCollapsed: true, components: { RowLabel: "@/components/admin/RowLabel#RowLabel" } },
                  fields: [{ name: "label", type: "text", label: "Название", required: true }, linkField(), hidden],
                },
              ],
            },
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
          label: "Главная страница",
          description: "Блок «Ближайшие мероприятия» на главной: большой блок слева, мероприятия справа и «Недавно прошло».",
          fields: [
            {
              name: "homeEvents",
              type: "group",
              label: "Мероприятия на главной",
              fields: [
                { name: "title", type: "text", label: "Заголовок блока", admin: { description: "Если пусто: «Ближайшие мероприятия»." } },
                {
                  name: "mode",
                  type: "radio",
                  label: "Какие мероприятия показывать",
                  defaultValue: "auto",
                  options: [
                    { label: "Автоматически: ближайшие и последнее прошедшее", value: "auto" },
                    { label: "Выбрать вручную", value: "manual" },
                  ],
                },
                {
                  name: "featured",
                  type: "relationship",
                  relationTo: "events",
                  label: "Большой блок слева",
                  admin: { condition: (_, sibling) => sibling?.mode === "manual" },
                },
                {
                  name: "side",
                  type: "relationship",
                  relationTo: "events",
                  hasMany: true,
                  label: "Справа сверху",
                  admin: { condition: (_, sibling) => sibling?.mode === "manual", description: "Одно или два мероприятия. Можно оставить пустым." },
                },
                {
                  name: "recent",
                  type: "relationship",
                  relationTo: "events",
                  label: "«Недавно прошло»",
                  admin: { condition: (_, sibling) => sibling?.mode === "manual", description: "Если пусто, этого блока не будет." },
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Фото в большом блоке слева",
                  admin: { description: "Горизонтальная фотография. Поверх неё будет затемнение, чтобы текст читался. Если пусто, блок синий, как сейчас." },
                },
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
