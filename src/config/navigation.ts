/** Пункт верхнего меню. Сами пункты редактируются в админке: «Структура сайта → Шапка, меню и подвал». */
export interface NavItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}
