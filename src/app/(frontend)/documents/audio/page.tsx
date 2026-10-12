import { getAudioTracks } from "@/lib/cms";
import { SLOGANS } from "@/config/slogans";
import { PageView, pageMetadata } from "@/components/page/PageView";
import { fileSize } from "@/components/documents/DocumentRow";
import { Empty } from "@/components/ui/Wip";

export const generateMetadata = () => pageMetadata("audio", { title: "Музыка для соревнований", description: "Звуковые дорожки для дисциплин роуп скиппинга: слушать онлайн и скачать в формате MP3." });

/** У дорожки «Прыжки через 2 скакалки 4 человека» есть 3D-схема смен */
const RELAY = "/participants/posobiya/2-skakalki-4-cheloveka";
const isRelay = (title: string) => /(2|две)\s+скакалк/i.test(title) && /4\s+человек/i.test(title);

export default async function AudioPage() {
  const tracks = (await getAudioTracks()).filter((t) => t.url);
  return (
    <PageView
      kind="audio"
      banner="documents"
      fallback={{ title: "Музыка для соревнований", lead: "Звуковые дорожки для дисциплин. Послушайте здесь или скачайте файл на телефон.", slogan: SLOGANS.audio }}
      documents={{ active: "/documents/audio" }}
      builtin={
        <>
      {tracks.length === 0 ? (
        <Empty>Звуковые дорожки пока не опубликованы.</Empty>
      ) : (
        <ul className="audio-list">
          {tracks.map((t) => (
            <li className="audio-item" key={t.id}>
              <p className="audio-item__title">{t.title}</p>
              <audio controls preload="none" src={t.url as string}>
                Ваш браузер не поддерживает воспроизведение аудио.
              </audio>
              <a href={t.url as string} download className="more" style={{ fontSize: "0.88rem", minHeight: 30 }}>
                Скачать MP3{t.filesize ? ` (${fileSize(t.filesize)})` : ""}
              </a>
              {isRelay(t.title) ? (
                <a href={RELAY} className="more" style={{ fontSize: "0.88rem", minHeight: 30 }}>
                  3D-схема смен и перемещений
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
        </>
      }
    />
  );
}
