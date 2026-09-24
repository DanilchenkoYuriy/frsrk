import { getPayload } from "payload";
import config from "@payload-config";

export const dynamic = "force-dynamic";

/**
 * Проверка для хостинга.
 * /api/health: сайт запущен (быстрый ответ, база не нужна, иначе хостинг перезапускает сайт, пока тот создаёт таблицы).
 * /api/health?db=1: дополнительно проверяет, что база отвечает.
 */
export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("db") !== "1") {
    return Response.json({ status: "ok" });
  }
  try {
    const payload = await getPayload({ config });
    await payload.count({ collection: "users", overrideAccess: true });
    return Response.json({ status: "ok", db: "ok" });
  } catch (error) {
    // Причина попадает в «Логи приложения» на хостинге: без неё не понять, что не так с базой.
    console.error("[health] база не отвечает:", error instanceof Error ? error.message : error);
    return Response.json({ status: "error", db: "error" }, { status: 503 });
  }
}
