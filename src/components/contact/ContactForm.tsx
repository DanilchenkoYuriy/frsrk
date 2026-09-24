"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { INQUIRY_TOPICS } from "@/lib/constants";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };

export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const topic = INQUIRY_TOPICS.some((t) => t.value === initialTopic) ? initialTopic : "general";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, consent: data.consent === "on" }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Не удалось отправить сообщение");
      form.reset();
      setState({ kind: "ok" });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Не удалось отправить сообщение" });
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <label className="field__label" htmlFor="f-topic">
          Тема обращения
        </label>
        <select id="f-topic" name="topic" className="select" defaultValue={topic}>
          {INQUIRY_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="f-name">
          Ваше имя
        </label>
        <input id="f-name" name="name" className="input" required maxLength={120} autoComplete="name" />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="f-email">
          Почта
        </label>
        <input id="f-email" name="email" type="email" className="input" maxLength={160} autoComplete="email" />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="f-phone">
          Телефон
        </label>
        <input id="f-phone" name="phone" type="tel" className="input" maxLength={40} autoComplete="tel" />
      </div>
      <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", marginTop: -6 }}>Укажите почту или телефон, чтобы мы могли ответить.</p>
      <div className="field">
        <label className="field__label" htmlFor="f-message">
          Сообщение
        </label>
        <textarea id="f-message" name="message" className="textarea" required minLength={10} maxLength={4000} />
      </div>
      <div className="hp" aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="form__check">
        <input type="checkbox" name="consent" required />
        <span>
          Согласен(на) на обработку персональных данных в соответствии с <Link href="/legal/privacy">политикой обработки персональных данных</Link>.
        </span>
      </label>
      <div>
        <button className="btn btn--red" type="submit" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Отправляем…" : "Отправить"}
        </button>
      </div>
      <div aria-live="polite">
        {state.kind === "ok" ? <p className="form__status form__status--ok">Сообщение отправлено. Мы ответим на указанную почту или телефон.</p> : null}
        {state.kind === "error" ? <p className="form__status form__status--error">{state.message}</p> : null}
      </div>
    </form>
  );
}
