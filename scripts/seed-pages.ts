/**
 * Только тексты страниц, без документов, людей и настроек.
 * Запуск: npm run seed:pages (своя база) или npm run seed:pages:prod (рабочий сайт, читает .env.prod).
 * Только нужные страницы: npm run seed:pages:prod -- privacy cookies
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { seedPageTexts } from "./seed-pages-lib";

const p = await getPayload({ config });
console.log("Тексты страниц");
await seedPageTexts(p, (msg) => console.log(`  ${msg}`), process.argv.slice(2));
process.exit(0);
