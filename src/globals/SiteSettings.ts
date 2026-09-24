import type { GlobalConfig } from "payload";
import { isStaff } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Данные федерации",
  admin: {
    group: "Система",
    description: "Название, контакты, реквизиты и ссылки. Они выводятся в шапке, подвале, на странице «Контакты» и в документах.",
  },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Название",
          fields: [
            { name: "fullName", type: "text", label: "Полное название", required: true, defaultValue: "Федерация роуп скиппинга (спортивной скакалки) Республики Крым" },
            { name: "shortName", type: "text", label: "Сокращение", required: true, defaultValue: "ФРСРК" },
            { name: "legalName", type: "text", label: "Название по Уставу (юридическое)", defaultValue: "Общественная организация «Федерация роуп скиппинга (спортивной скакалки) Республики Крым»" },
            { name: "description", type: "textarea", label: "Описание сайта для поисковиков и соцсетей", defaultValue: "Официальный сайт Федерации роуп скиппинга (спортивной скакалки) Республики Крым: календарь соревнований, секции, документы, новости." },
            { name: "heroImage", type: "upload", relationTo: "media", label: "Главная картинка на первом экране" },
            { name: "ogImage", type: "upload", relationTo: "media", label: "Картинка для ссылок в VK и Telegram (1200×630)" },
          ],
        },
        {
          label: "Полосы заголовков",
          admin: { description: "Картинка на тёмной полосе в начале страницы. Если поле пустое, показывается «Главная картинка на первом экране». Подойдёт любая горизонтальная фотография: главный объект лучше справа, слева текст." },
          fields: [
            {
              name: "banners",
              type: "group",
              label: "Картинки по разделам",
              fields: [
                { name: "calendar", type: "upload", relationTo: "media", label: "Календарь" },
                { name: "documents", type: "upload", relationTo: "media", label: "Документы (включая правила и музыку)" },
                { name: "news", type: "upload", relationTo: "media", label: "Новости" },
                { name: "media", type: "upload", relationTo: "media", label: "Медиа" },
                { name: "sections", type: "upload", relationTo: "media", label: "Найти секцию" },
                { name: "contacts", type: "upload", relationTo: "media", label: "Контакты" },
                { name: "participants", type: "upload", relationTo: "media", label: "Участникам (тренерам, судьям, родителям, рейтинг, антидопинг)" },
                { name: "about", type: "upload", relationTo: "media", label: "О федерации (руководство, реквизиты, история)" },
              ],
            },
          ],
        },
        {
          label: "Контакты",
          fields: [
            { name: "phone", type: "text", label: "Телефон", defaultValue: "+7 978 738-32-46" },
            { name: "email", type: "email", label: "Почта", defaultValue: "crimea.skipping@mail.ru" },
            { name: "address", type: "text", label: "Адрес", defaultValue: "295003, Республика Крым, г. Симферополь, ул. Балаклавская, д. 41, офис 118" },
            { name: "vk", type: "text", label: "Ссылка на VK", defaultValue: "https://vk.ru/rope_skipping_crimea" },
            { name: "telegram", type: "text", label: "Ссылка на Telegram", defaultValue: "https://t.me/+3uyHm_gL9wtmNzRi" },
          ],
        },
        {
          label: "Реквизиты",
          fields: [
            { name: "ogrn", type: "text", label: "ОГРН", defaultValue: "1249100003448" },
            { name: "inn", type: "text", label: "ИНН" },
            { name: "kpp", type: "text", label: "КПП" },
            { name: "bankDetails", type: "textarea", label: "Банковские реквизиты" },
            {
              name: "accreditation",
              type: "group",
              label: "Государственная аккредитация",
              fields: [
                { name: "orderNumber", type: "text", label: "Номер приказа", defaultValue: "242-ОД" },
                { name: "orderDate", type: "date", label: "Дата приказа", defaultValue: "2024-04-22T00:00:00.000Z", admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } } },
                { name: "issuedBy", type: "text", label: "Кем выдана", defaultValue: "Министерство спорта Республики Крым" },
                { name: "term", type: "text", label: "Срок аккредитации", defaultValue: "три года со дня подписания приказа" },
                { name: "vrvsCode", type: "text", label: "Код вида спорта по ВРВС", defaultValue: "1780001411Я" },
              ],
            },
          ],
        },
        {
          label: "Служебное",
          admin: { description: "Только для администратора." },
          fields: [
            { name: "metrikaId", type: "text", label: "Номер счётчика Яндекс.Метрики", access: { update: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin" } },
            { name: "notifyEmail", type: "email", label: "Куда присылать письма с формы обратной связи", access: { update: ({ req: { user } }) => (user as { role?: string } | null)?.role === "admin" } },
          ],
        },
      ],
    },
  ],
};

