import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { INQUIRY_TOPICS } from "@/lib/constants";
import type { Inquiry } from "@/payload-types";

export const runtime = "nodejs";

const schema = z
  .object({
    topic: z.enum(INQUIRY_TOPICS.map((t) => t.value) as [Inquiry["topic"], ...Inquiry["topic"][]]),
    name: z.string().trim().min(2).max(120),
    email: z.union([z.literal(""), z.string().trim().email().max(160)]).optional(),
    phone: z.string().trim().max(40).optional(),
    message: z.string().trim().min(10).max(4000),
    consent: z.literal(true),
    website: z.string().optional(),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.phone?.trim()), { message: "Укажите почту или телефон", path: ["email"] });

/** Не больше 5 сообщений в час с одного адреса (счётчик в памяти одного экземпляра сайта). */
const hits = new Map<string, number[]>();
const WINDOW = 60 * 60 * 1000;
const LIMIT = 5;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return fail("Слишком много сообщений. Попробуйте позже.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Некорректный запрос", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const messages: Record<string, string> = {
      name: "Введите имя",
      message: "Сообщение должно быть не короче 10 символов",
      consent: "Нужно согласие на обработку персональных данных",
      email: first?.message === "Укажите почту или телефон" ? first.message : "Проверьте адрес почты",
    };
    return fail(messages[String(first?.path[0])] ?? "Проверьте заполнение формы", 400);
  }

  // Поле-ловушка для роботов: людям оно не видно
  if (parsed.data.website) return Response.json({ ok: true });

  const payload = await getPayload({ config });
  const { website: _website, ...data } = parsed.data;
  void _website;
  const created = await payload.create({
    collection: "inquiries",
    data: { ...data, email: data.email || undefined, status: "new" },
    overrideAccess: true,
  });

  try {
    const settings = await payload.findGlobal({ slug: "site-settings", overrideAccess: true });
    if (settings.notifyEmail) {
      await payload.sendEmail({
        to: settings.notifyEmail,
        subject: `Новое обращение с сайта: ${data.name}`,
        text: `Тема: ${data.topic}\nИмя: ${data.name}\nПочта: ${data.email ?? "—"}\nТелефон: ${data.phone ?? "—"}\n\n${data.message}\n\nОбращение №${created.id} в админке.`,
      });
    }
  } catch (err) {
    payload.logger.error({ err }, "Не удалось отправить письмо о новом обращении");
  }

  return Response.json({ ok: true });
}
