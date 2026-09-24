/**
 * Готовит картинки для загрузки на сервер:
 *  - уменьшает фотографии до 2400 px по длинной стороне;
 *  - собирает иллюстрации и картинку для превью ссылок (OG);
 *  - делает значки сайта (favicon) из логотипа.
 * Запуск: npm run images:optimize
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "seed-assets");
const out = path.join(src, "prepared");
const brand = path.join(root, "public", "brand");

fs.mkdirSync(path.join(out, "photos"), { recursive: true });

/**
 * Главное фото первого экрана (seed-assets/source/hero-home.png) и картинка остальных страниц
 * (seed-assets/source/inner-banner.png) переводятся в WebP: они лёгкие, сайт сам делает из них
 * адаптивные размеры (400, 800, 1600 px).
 */
async function heroPhotos() {
  for (const [source, target] of [
    ["hero-home.png", "hero-home.webp"],
    ["inner-banner.png", "inner-banner.webp"],
  ]) {
    const file = path.join(src, "source", source);
    if (!fs.existsSync(file)) {
      console.warn(`пропуск ${source}: файла нет`);
      continue;
    }
    await sharp(file).resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(path.join(out, target));
    console.log("готово", target);
  }
}

async function og() {
  const hero = path.join(src, "source", "hero-home.png");
  if (!fs.existsSync(hero)) return;
  const W = 1200;
  const H = 630;
  const base = await sharp(hero).resize(W, H, { fit: "cover", position: "right" }).toBuffer();
  const logo = await sharp(path.join(brand, "frsrk-logo.png")).resize({ height: 300 }).toBuffer();
  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#071426" stop-opacity="0.96"/><stop offset="0.6" stop-color="#071426" stop-opacity="0.8"/><stop offset="1" stop-color="#071426" stop-opacity="0.1"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect y="${H - 16}" width="${W / 3}" height="16" fill="#0d5db8"/><rect x="${W / 3}" y="${H - 16}" width="${W / 3}" height="16" fill="#fff"/><rect x="${(2 * W) / 3}" y="${H - 16}" width="${W / 3}" height="16" fill="#d20f2d"/>
      <text x="80" y="230" font-family="Helvetica Neue, Arial, sans-serif" font-size="62" font-weight="700" fill="#fff">Федерация роуп</text>
      <text x="80" y="305" font-family="Helvetica Neue, Arial, sans-serif" font-size="62" font-weight="700" fill="#fff">скиппинга</text>
      <text x="80" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="62" font-weight="700" fill="#f0cf85">Республики Крым</text>
      <text x="80" y="450" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" fill="#ffffffcc">Спортивная скакалка. Секции, календарь, документы</text>
    </svg>`,
  );
  await sharp(base)
    .composite([{ input: overlay }, { input: logo, left: W - 420, top: 150 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(out, "og.jpg"));
  console.log("готово og");
}

async function icons() {
  const logo = path.join(brand, "frsrk-logo.png");
  const trimmed = await sharp(logo).trim().toBuffer();
  const square = async (size: number, file: string, bg?: string) => {
    const inner = await sharp(trimmed).resize(Math.round(size * 0.86), Math.round(size * 0.86), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: inner, gravity: "center" }])
      .png()
      .toFile(path.join(brand, file));
  };
  await square(64, "favicon.png");
  await square(180, "apple-touch-icon.png", "#ffffff");
  console.log("готово favicon");
}

async function photos() {
  const dir = path.join(src, "photos-src");
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|webp)$/i.test(f)).sort();
  let i = 0;
  for (const f of files) {
    i += 1;
    const target = path.join(out, "photos", `foto-${String(i).padStart(2, "0")}.jpg`);
    await sharp(path.join(dir, f)).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
  }
  console.log(`фото: ${files.length}`);
}



await heroPhotos();
await og();
await icons();
await photos();
