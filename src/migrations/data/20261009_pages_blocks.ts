import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Перенос сайта на «Страницы сайта» с блоками (миграция 20261009_190222_pages_blocks).
 * Всё, что владелец уже настроил, сохраняется: тексты страниц, скрытые пункты меню, пункты разделов,
 * мероприятия и фото на главной, первый экран. Значения по умолчанию взяты из прежнего кода страниц.
 */

type Db = MigrateUpArgs['db']
type Row = Record<string, unknown>

const rows = async (db: Db, query: ReturnType<typeof sql>) => (await db.execute(query)).rows as Row[]
const tableExists = async (db: Db, name: string) =>
  (await rows(db, sql`SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${name}`)).length > 0
const columnExists = async (db: Db, table: string, column: string) =>
  (await rows(db, sql`SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}`)).length > 0

export async function readOld(db: Db) {
  const pages = await rows(db, sql`SELECT "id", "key", "title", "lead", "body", "slug", "section_id", "published" FROM "pages" ORDER BY "id"`)
  const has = {
    sections: await tableExists(db, 'site_sections'),
    menu: await tableExists(db, 'site_layout_menu'),
    tabs: await tableExists(db, 'pages_tabs'),
    homeEvents: await columnExists(db, 'site_layout', 'home_events_mode'),
  }
  const sections = has.sections ? await rows(db, sql`SELECT "id", "title", "slug", "banner_id", "slogan", "published" FROM "site_sections" ORDER BY "id"`) : []
  const sectionItems = has.sections
    ? await rows(db, sql`SELECT "_parent_id", "_order", "label", "link_type", "link_route", "link_page_id", "hidden" FROM "site_sections_items" ORDER BY "_parent_id", "_order"`)
    : []
  const menu = has.menu ? await rows(db, sql`SELECT "_order", "label", "link_type", "link_route", "link_page_id", "hidden" FROM "site_layout_menu" ORDER BY "_order"`) : []
  const layout = (await rows(db, sql`SELECT * FROM "site_layout" ORDER BY "id" LIMIT 1`))[0] ?? {}
  const homeSide = has.homeEvents && (await tableExists(db, 'site_layout_rels'))
    ? (await rows(db, sql`SELECT "events_id" FROM "site_layout_rels" WHERE "path" = 'homeEvents.side' ORDER BY "order"`)).map((r) => r.events_id as number)
    : []
  const settings = (await rows(db, sql`SELECT * FROM "site_settings" ORDER BY "id" LIMIT 1`))[0] ?? {}

  // Вкладки с блоками, которые можно было собирать в текстовых страницах до этой версии
  const tabs = has.tabs ? await rows(db, sql`SELECT "id", "_parent_id", "_order", "label", "hidden" FROM "pages_tabs" ORDER BY "_parent_id", "_order"`) : []
  const tabBlocks = has.tabs
    ? {
        text: await rows(db, sql`SELECT * FROM "pages_blocks_text" WHERE "_path" LIKE 'tabs.%'`),
        documents: await rows(db, sql`SELECT * FROM "pages_blocks_documents" WHERE "_path" LIKE 'tabs.%'`),
        buttons: await rows(db, sql`SELECT * FROM "pages_blocks_buttons" WHERE "_path" LIKE 'tabs.%'`),
        buttonRows: await rows(db, sql`SELECT * FROM "pages_blocks_buttons_buttons" ORDER BY "_order"`),
        image: await rows(db, sql`SELECT * FROM "pages_blocks_image" WHERE "_path" LIKE 'tabs.%'`),
        rels: await rows(db, sql`SELECT "parent_id", "path", "documents_id", "order" FROM "pages_rels" WHERE "path" LIKE 'tabs.%' ORDER BY "order"`),
      }
    : null

  return { pages, sections, sectionItems, menu, layout, homeSide, settings, tabs, tabBlocks }
}

type Old = Awaited<ReturnType<typeof readOld>>

const SLOGANS: Record<string, string> = {
  calendar: 'Развиваем спорт вместе',
  documents: 'Развиваем спорт вместе',
  rules: 'Знаем правила, играем честно',
  audio: 'Сила в движении',
  news: 'Будьте в курсе',
  media: 'Сила в движении',
  sections: 'Спорт доступен каждому',
  contacts: 'На связи со спортом',
  coaches: 'Развиваем людей — развиваем спорт',
  judges: 'Честная оценка, честный спорт',
  parents: 'Спорт для всей семьи',
  ranking: 'Растим чемпионов',
  antidoping: 'Чистый спорт — сильнее',
  about: 'Больше, чем спорт',
  leadership: 'Команда федерации',
  requisites: 'Открыто и честно',
  history: 'Наша история',
}

/** Встроенные страницы: заголовок, текст под ним и название в меню — как было в коде страниц. */
const DEFAULTS: Record<string, { title: string; lead?: string; menu?: string; parent?: string; builtin?: boolean }> = {
  home: { title: 'Главная' },
  calendar: { title: 'Календарь мероприятий', menu: 'Календарь', builtin: true, lead: 'Соревнования, семинары и сборы федерации. Откройте мероприятие, чтобы найти положение, регистрацию и протоколы.' },
  documents: { title: 'Документы', builtin: true, lead: 'Документы федерации и вида спорта. Файлы хранятся на сервере ФРСРК.' },
  rules: { title: 'Правила вида спорта', parent: 'documents', builtin: true, lead: 'Правила вида спорта «роуп скиппинг (спортивная скакалка)».' },
  audio: { title: 'Музыка для соревнований', parent: 'documents', builtin: true, lead: 'Звуковые дорожки для дисциплин. Послушайте здесь или скачайте файл на телефон.' },
  news: { title: 'Новости', builtin: true, lead: 'Сообщения федерации: соревнования, итоги, обучение.' },
  media: { title: 'Медиа', builtin: true, lead: 'Фотографии и видео с мероприятий федерации.' },
  participants: { title: 'Участникам' },
  coaches: { title: 'Тренерам', parent: 'participants' },
  judges: { title: 'Судьям', parent: 'participants' },
  parents: { title: 'Родителям', parent: 'participants' },
  ranking: { title: 'Рейтинг спортсменов', parent: 'participants', builtin: true, lead: 'Результаты спортсменов Республики Крым по сезонам, дисциплинам и возрастным группам.' },
  antidoping: { title: 'Антидопинг', parent: 'participants' },
  about: { title: 'О федерации' },
  leadership: { title: 'Руководство и представители', menu: 'Руководство', parent: 'about', builtin: true },
  requisites: { title: 'Реквизиты и аккредитация', menu: 'Реквизиты', parent: 'about', builtin: true, lead: 'Сведения об организации, государственной аккредитации и учредительные документы.' },
  history: { title: 'История', parent: 'about' },
  contacts: { title: 'Контакты', builtin: true, lead: 'Напишите нам или позвоните. Отвечаем на вопросы о занятиях, соревнованиях, судействе и открытии секций.' },
  sections: { title: 'Найти секцию', builtin: true, lead: 'Выберите муниципальное образование на карте или найдите секцию через поиск. В карточке есть телефон тренера и маршрут.' },
  privacy: { title: 'Политика обработки персональных данных' },
  cookies: { title: 'Файлы cookie' },
}

/** Порядок по умолчанию: верх меню, затем страницы вне меню. Дочерние идут сразу за своим разделом. */
const TOP = ['home', 'calendar', 'documents', 'news', 'media', 'participants', 'about', 'contacts', 'sections', 'privacy', 'cookies']
const CHILDREN: Record<string, string[]> = {
  documents: ['rules', 'audio'],
  participants: ['coaches', 'judges', 'parents', 'ranking', 'antidoping'],
  about: ['leadership', 'requisites', 'history'],
}

/** Прежние ключи текстовых страниц → новые типы страниц. */
const KEY_TO_KIND: Record<string, string> = { 'education-judges': 'judges', 'education-coaches': 'coaches' }

/** Пункты прежнего меню и разделов указывали адрес из списка; почти все совпадают с типом страницы. */
const routeKind = (route: unknown) => (typeof route === 'string' && DEFAULTS[route] ? route : null)

/** Ключ порядка (как у Payload: цифры и строчные латинские буквы, по возрастанию). */
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
const orderKey = (i: number) => (i < 36 ? `a${DIGITS[i]}` : `b${DIGITS[Math.floor(i / 36) % 36]}${DIGITS[i % 36]}`)

const RUSADA = [
  { title: 'Проверить препарат', text: 'Сервис РУСАДА: можно ли принимать лекарство спортсмену.', url: 'https://list.rusada.ru' },
  { title: 'Пройти онлайн-курс', text: 'Антидопинговое обучение и сертификат на платформе РУСАДА.', url: 'https://course.rusada.ru' },
  { title: 'Раздел «Спортсменам» на сайте РУСАДА', text: 'Запрещённый список, терапевтическое использование, права и обязанности.', url: 'https://www.rusada.ru/athletes/' },
  { title: 'Сообщить о нарушении', text: 'Форма РУСАДА для сообщений о допинге.', url: 'https://rusada.ru/doping-control/investigations/report-about-doping/' },
]

type Block = Record<string, unknown> & { blockType: string }

const link = {
  page: (id: number | undefined) => ({ type: 'page', page: id ?? null }),
  url: (url: string) => ({ type: 'url', url }),
}

/** Старые вкладки страницы → блок «Вкладки». */
function oldTabsBlock(old: Old, pageId: number): Block | null {
  if (!old.tabBlocks) return null
  const tabs = old.tabs.filter((t) => t._parent_id === pageId)
  if (!tabs.length) return null
  const content = (index: number) => {
    const path = `tabs.${index}.blocks`
    const own = <T extends Row>(list: T[]) => list.filter((b) => b._parent_id === pageId && b._path === path)
    const blocks: (Block & { _order: number })[] = [
      ...own(old.tabBlocks!.text).map((b) => ({ blockType: 'text', _order: b._order as number, content: b.content })),
      ...own(old.tabBlocks!.documents).map((b) => ({
        blockType: 'documents',
        _order: b._order as number,
        title: b.title,
        mode: b.mode,
        category: b.category,
        // Номер блока в адресе связи считается с нуля, а _order с единицы
        documents: old.tabBlocks!.rels.filter((r) => r.parent_id === pageId && r.path === `${path}.${(b._order as number) - 1}.documents`).map((r) => r.documents_id),
      })),
      ...own(old.tabBlocks!.buttons).map((b) => ({
        blockType: 'buttons',
        _order: b._order as number,
        buttons: old.tabBlocks!.buttonRows
          .filter((r) => r._parent_id === b.id)
          .map((r) => ({ label: r.label, style: r.style, link: { type: r.link_type, route: r.link_route, page: r.link_page_id, url: r.link_url } })),
      })),
      ...own(old.tabBlocks!.image).map((b) => ({ blockType: 'image', _order: b._order as number, image: b.image_id, caption: b.caption })),
    ]
    return blocks.sort((a, b) => a._order - b._order).map(({ _order: _, ...b }) => b)
  }
  return { blockType: 'tabs', tabs: tabs.map((t, i) => ({ label: t.label, hidden: t.hidden, content: content(i) })) }
}

export async function moveData({ payload, req, db, old }: Pick<MigrateUpArgs, 'payload' | 'req' | 'db'> & { old: Old }) {
  // Строки старых вкладок больше никому не принадлежат
  for (const table of ['pages_blocks_text', 'pages_blocks_documents', 'pages_blocks_buttons', 'pages_blocks_image']) {
    await db.execute(sql.raw(`DELETE FROM "${table}" WHERE "_path" LIKE 'tabs.%'`))
  }
  await db.execute(sql`DELETE FROM "pages_rels" WHERE "path" LIKE 'tabs.%'`)

  const byKind = new Map<string, Row>()
  for (const p of old.pages) if (p.key) byKind.set(KEY_TO_KIND[p.key as string] ?? (p.key as string), p)

  // ── 1. Все встроенные страницы существуют (создаются недостающие) ──────────
  const ids = new Map<string, number>()
  for (const kind of Object.keys(DEFAULTS)) {
    const existing = byKind.get(kind)
    const d = DEFAULTS[kind]
    const minimal = { kind, layout: d.builtin ? [{ blockType: 'builtin' }] : [] }
    if (existing) {
      await payload.update({ collection: 'pages', id: existing.id as number, data: minimal as never, req, overrideAccess: true, context: { migration: true } })
      ids.set(kind, existing.id as number)
    } else {
      const doc = await payload.create({ collection: 'pages', data: { ...minimal, title: d.title, published: true } as never, req, overrideAccess: true, context: { migration: true } })
      ids.set(kind, doc.id)
    }
  }

  // Разделы, созданные владельцем в «Разделах с боковым меню», становятся страницами-разделами
  const sectionPage = new Map<number, number>()
  for (const s of old.sections) {
    const kind = routeKind(s.slug)
    if (kind && ids.has(kind)) {
      sectionPage.set(s.id as number, ids.get(kind)!)
      continue
    }
    const doc = await payload.create({
      collection: 'pages',
      data: { kind: 'custom', title: s.title, slug: s.slug, published: s.published !== false, banner: s.banner_id ?? null, slogan: s.slogan ?? null, layout: [] } as never,
      req,
      overrideAccess: true,
      context: { migration: true },
    })
    sectionPage.set(s.id as number, doc.id)
  }
  const kindOfId = new Map([...ids].map(([k, v]) => [v, k]))

  // ── 2. Дерево и меню ──────────────────────────────────────────────────────
  type Place = { parent: number | null; showInMenu: boolean; alsoInTopMenu: boolean; menuLabel: string | null }
  const place = new Map<number, Place>()
  const set = (id: number, patch: Partial<Place>) => place.set(id, { parent: null, showInMenu: true, alsoInTopMenu: false, menuLabel: null, ...place.get(id), ...patch })

  for (const kind of Object.keys(DEFAULTS)) {
    const d = DEFAULTS[kind]
    set(ids.get(kind)!, { parent: d.parent ? ids.get(d.parent)! : null, menuLabel: d.menu ?? null, showInMenu: !TOP.includes(kind) || TOP.indexOf(kind) < 8 })
  }

  // Пункты разделов: что было скрыто или убрано, не показывается в меню слева
  const itemsBySection = new Map<number, Row[]>()
  for (const item of old.sectionItems) itemsBySection.set(item._parent_id as number, [...(itemsBySection.get(item._parent_id as number) ?? []), item])
  const sectionOrder = new Map<number, number[]>()
  for (const [sectionId, items] of itemsBySection) {
    const parent = sectionPage.get(sectionId)
    if (!parent) continue
    const order: number[] = []
    for (const item of items) {
      const target = item.link_type === 'page' ? (item.link_page_id as number | null) : ids.get(routeKind(item.link_route) ?? '')
      if (!target || target === parent) continue
      order.push(target)
      set(target, { parent, showInMenu: !item.hidden, menuLabel: item.label !== (old.pages.find((p) => p.id === target)?.title ?? DEFAULTS[kindOfId.get(target) ?? '']?.title) ? (item.label as string) : place.get(target)?.menuLabel ?? null })
    }
    sectionOrder.set(parent, order)
    // Встроенные пункты, которые владелец убрал из раздела, остаются в разделе, но без пункта в меню
    for (const kind of CHILDREN[kindOfId.get(parent) ?? ''] ?? []) {
      const id = ids.get(kind)!
      if (!order.includes(id)) set(id, { showInMenu: false })
    }
  }
  // Новые страницы владельца, привязанные к разделу
  for (const p of old.pages) {
    if (!p.key && p.section_id && sectionPage.has(p.section_id as number) && !place.get(p.id as number)?.parent) set(p.id as number, { parent: sectionPage.get(p.section_id as number)! })
  }

  // Верхнее меню: порядок и скрытые пункты как были
  const topOrder: number[] = []
  if (old.menu.length) {
    for (const top of TOP) set(ids.get(top)!, { showInMenu: false })
    for (const item of old.menu) {
      const target = item.link_type === 'page' ? (item.link_page_id as number | null) : ids.get(routeKind(item.link_route) ?? '')
      if (!target) continue
      const p = place.get(target)
      if (p?.parent) {
        set(target, { alsoInTopMenu: !item.hidden })
      } else {
        topOrder.push(target)
        const title = old.pages.find((x) => x.id === target)?.title ?? DEFAULTS[kindOfId.get(target) ?? '']?.title
        set(target, { showInMenu: !item.hidden, menuLabel: item.label !== title ? (item.label as string) : (p?.menuLabel ?? null) })
      }
    }
  } else {
    set(ids.get('antidoping')!, { alsoInTopMenu: true })
  }

  // ── 3. Содержимое страниц ────────────────────────────────────────────────
  const settings = old.settings
  const layout = old.layout
  const text = (body: unknown, splitTabs: boolean): Block[] => (body ? [{ blockType: 'text', content: body, splitTabs }] : [])
  const oldPage = (kind: string) => byKind.get(kind)

  const blocksFor = (kind: string | null, page: Row | undefined): Block[] => {
    const body = page?.body
    const tabs = page ? oldTabsBlock(old, page.id as number) : null
    const extra = tabs ? [tabs] : []
    switch (kind) {
      case 'home':
        return [
          {
            blockType: 'hero',
            title: settings.hero_title || 'От первого прыжка до сборной Крыма',
            lead: settings.hero_lead || 'Роуп скиппинг (спортивная скакалка): секции по городам республики, календарь соревнований, положения и протоколы.',
            mode: settings.hero_mode ?? 'photo',
            image: settings.hero_image_id ?? null,
            video: settings.hero_video_id ?? null,
            videoMobile: Boolean(settings.hero_video_mobile),
            buttons: [
              { label: 'Найти секцию', link: link.page(ids.get('sections')), style: 'red' },
              { label: 'Календарь соревнований', link: link.page(ids.get('calendar')), style: 'light' },
            ],
          },
          // Полоса цифр была выключена в коде: секций и мероприятий пока мало
          { blockType: 'stats', hidden: true },
          {
            blockType: 'events',
            kicker: 'Календарь',
            title: layout.home_events_title || 'Ближайшие мероприятия',
            mode: layout.home_events_mode ?? 'auto',
            featured: layout.home_events_featured_id ?? null,
            side: old.homeSide,
            recent: layout.home_events_recent_id ?? null,
            image: layout.home_events_image_id ?? null,
          },
          { blockType: 'sectionsMap', kicker: 'Где заниматься', title: 'Найдите секцию рядом с домом' },
          { blockType: 'gallery', kicker: 'Медиа', title: 'Как это выглядит' },
          { blockType: 'news', kicker: 'Новости', title: 'Что нового в федерации', count: 3 },
          {
            blockType: 'tiles',
            kicker: 'Документы',
            title: 'Всё, что нужно спортсмену, тренеру и судье',
            moreLabel: 'Все документы',
            moreLink: link.page(ids.get('documents')),
            items: [
              { icon: 'scroll', title: 'Устав и аккредитация', text: 'Учредительные документы и аккредитация федерации', link: link.url('/documents?category=federation') },
              { icon: 'book', title: 'Правила вида спорта', text: 'Полный текст, дисциплины, судейство', link: link.page(ids.get('rules')) },
              { icon: 'medal', title: 'ЕВСК и разряды', text: 'Нормы и порядок присвоения', link: link.url('/documents?category=classification') },
              { icon: 'music', title: 'Музыка для соревнований', text: 'Слушать и скачать', link: link.page(ids.get('audio')) },
            ],
          },
          {
            blockType: 'contactBand',
            title: 'Остались вопросы?',
            text: 'О занятиях, соревнованиях, судействе и открытии новых секций. Напишите или позвоните.',
            buttonLabel: 'Написать в федерацию',
            buttonLink: link.page(ids.get('contacts')),
          },
        ]
      case 'rules':
        return [{ blockType: 'builtin', content: body ?? null }, ...extra]
      case 'leadership':
      case 'media':
        return [...text(body, false), { blockType: 'builtin' }, ...extra]
      case 'about':
        return [...text(body, false), ...extra]
      case 'privacy':
      case 'cookies':
        return [...text(body, false), ...extra]
      case 'history':
        return [...text(body, true), ...extra]
      case 'parents':
        return [
          ...text(body, true),
          {
            blockType: 'buttons',
            buttons: [
              { label: 'Найти секцию рядом', link: link.page(ids.get('sections')), style: 'red' },
              { label: 'Разряды и ЕВСК', link: link.url('/documents?category=classification'), style: 'line' },
              { label: 'Антидопинг', link: link.page(ids.get('antidoping')), style: 'line' },
            ],
          },
          ...extra,
        ]
      case 'coaches':
        return [...text(body, true), { blockType: 'documents', title: 'Стандарты и программы подготовки', mode: 'category', category: 'education' }, ...extra]
      case 'judges':
        return [...text(body, true), { blockType: 'documents', title: 'Правила и положения о судействе', mode: 'category', category: 'rules' }, ...extra]
      case 'antidoping':
        return [
          ...text(body, true),
          { blockType: 'links', title: 'Сервисы РУСАДА', items: RUSADA },
          { blockType: 'documents', title: 'Документы', mode: 'category', category: 'antidoping' },
          ...extra,
        ]
      case 'participants':
        return []
      case null:
        // Новая страница владельца: прежний текст делился на вкладки по заголовкам
        return [...text(body, true), ...extra]
      default:
        return [...text(body, false), { blockType: 'builtin' }, ...extra]
    }
  }

  const allIds = [...new Set([...ids.values(), ...sectionPage.values(), ...old.pages.map((p) => p.id as number)])]
  for (const id of allIds) {
    const kind = kindOfId.get(id) ?? null
    const page = kind ? oldPage(kind) : old.pages.find((p) => p.id === id)
    const d = kind ? DEFAULTS[kind] : null
    const p = place.get(id) ?? { parent: null, showInMenu: true, alsoInTopMenu: false, menuLabel: null }
    const isSectionPage = !kind && [...sectionPage.values()].includes(id) && !old.pages.some((x) => x.id === id)
    const data: Record<string, unknown> = {
      parent: p.parent,
      showInMenu: p.showInMenu,
      alsoInTopMenu: p.alsoInTopMenu,
      menuLabel: p.menuLabel,
    }
    if (!isSectionPage) data.layout = blocksFor(kind, page)
    if (kind && d) {
      // У встроенных страниц заголовок был в коде; у текстовых — в админке
      const codeTitle = d.builtin || kind === 'participants' || kind === 'home'
      data.title = codeTitle ? d.title : ((page?.title as string) ?? d.title)
      data.lead = (page?.lead as string) ?? d.lead ?? null
      data.slogan = SLOGANS[kind] ?? null
      if (data.menuLabel === null && d.menu) data.menuLabel = d.menu
      if (!codeTitle && page?.title && page.title !== d.title && !data.menuLabel) data.menuLabel = d.title
    }
    await payload.update({ collection: 'pages', id, data: data as never, req, overrideAccess: true, context: { migration: true } })
  }

  // ── 4. Порядок страниц в списке (он же порядок в меню) ────────────────────
  const order: number[] = []
  const push = (id: number | undefined) => id && !order.includes(id) && order.push(id)
  const childrenOf = (parent: number) => [
    ...(sectionOrder.get(parent) ?? []),
    ...(CHILDREN[kindOfId.get(parent) ?? ''] ?? []).map((k) => ids.get(k)!),
    ...allIds.filter((id) => place.get(id)?.parent === parent),
  ]
  const tops = [...topOrder, ...TOP.map((k) => ids.get(k)!), ...allIds.filter((id) => !place.get(id)?.parent)]
  for (const top of tops) {
    if (order.includes(top)) continue
    push(top)
    for (const child of childrenOf(top)) push(child)
  }
  for (const id of allIds) push(id)
  for (const [i, id] of order.entries()) {
    await db.execute(sql`UPDATE "pages" SET "_order" = ${orderKey(i)} WHERE "id" = ${id}`)
  }
}
