import type { Metadata } from "next";
import { getAudioTracks } from "@/lib/cms";
import { SLOGANS } from "@/config/slogans";
import { DocumentsPage } from "@/components/documents/DocumentsPage";
import { fileSize } from "@/components/documents/DocumentRow";
import { Empty } from "@/components/ui/Wip";

export const metadata: Metadata = {
  title: "Музыка для соревнований",
  description: "Звуковые дорожки для дисциплин роуп скиппинга: слушать онлайн и скачать в формате MP3.",
};

export default async function AudioPage() {
  const tracks = (await getAudioTracks()).filter((t) => t.url);
  return (
    <DocumentsPage active="audio" title="Музыка для соревнований" lead="Звуковые дорожки для дисциплин. Послушайте здесь или скачайте файл на телефон." slogan={SLOGANS.audio} crumbLabel="Музыка">
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
            </li>
          ))}
        </ul>
      )}
    </DocumentsPage>
  );
}
