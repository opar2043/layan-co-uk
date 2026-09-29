"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useMessages, useSendMessage, useThreads } from "@/hooks/useMessages";
import { formatTime, idOf } from "@/lib/utils";
import EmptyState from "@/components/Public/EmptyState";

/**
 * Extracts the customer id from a thread key.
 *
 * The backend builds `threadId` as `"<customerId>_<businessId>"`; both halves are
 * ObjectId hex, which never contains an underscore, so the first segment is the
 * customer. This is how the inbox list is turned back into something clickable —
 * `GET /messages/threads` returns no customer document, only the key.
 */
export function customerIdFromThread(threadId) {
  if (typeof threadId !== "string" || !threadId.includes("_")) return null;
  const customerId = threadId.split("_")[0];
  return customerId || null;
}

/**
 * Conversation thread.
 *
 * `GET /messages` returns ONE thread oldest-first, not a list: a customer passes
 * `?businessId=`, the business side passes `?customerId=`. `POST /messages` mirrors
 * that. A message carries `senderRole` ("customer" | "business") rather than a
 * populated sender, so alignment is decided by role.
 */
export default function MessageThread({
  businessId,
  customerId,
  emptyTitle = "No messages yet",
  emptyDescription = "Start a conversation below.",
  className = "",
}) {
  const params = businessId ? { businessId } : { customerId };
  const { data, isLoading, error } = useMessages(params);
  const send = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const messages = data?.messages ?? [];

  // Stick to the newest message as the thread grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const submit = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    try {
      await send.mutateAsync({ ...params, text: body });
      setText("");
    } catch {
      /* useSendMessage raises its own toast */
    }
  };

  if (error) {
    return <EmptyState icon={MessageSquare} title="Could not load messages" description={error.message} />;
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card ${className}`}>
      <div className="mb-4 border-b border-border px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">{emptyTitle}</h2>
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 sm:px-5"
        style={{ maxHeight: "26rem" }}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-14 w-2/3 rounded-2xl" />
          ))
        ) : messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{emptyDescription}</div>
        ) : (
          messages.map((message) => {
            // Business replies sit on the right; customer messages on the left.
            const fromBusiness = message.senderRole === "business";
            return (
              <div key={idOf(message) ?? `${message.createdAt}-${message.text?.slice(0, 8)}`}
                className={`flex ${fromBusiness ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    fromBusiness
                      ? "rounded-br-sm bg-accent text-white"
                      : "rounded-bl-sm bg-muted text-primary"
                  }`}
                >
                  {!fromBusiness && (
                    <p className="mb-0.5 text-[11px] font-semibold opacity-70">
                      {message.isAutoFaqReply ? "Automated reply" : "You"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      fromBusiness ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3">
        <label htmlFor="message-text" className="sr-only">
          Message
        </label>
        <textarea
          id="message-text"
          rows={1}
          maxLength={2000}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter inserts a newline.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(event);
            }
          }}
          placeholder="Type a message…"
          className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          className="btn-accent shrink-0 px-3.5"
          aria-label="Send message"
        >
          {send.isPending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Thread list for the business side.
 *
 * `GET /messages/threads` is owner/staff only (an admin gets a 403), so this is
 * only rendered on the owner and staff dashboards. It returns
 * `{ threadId, messageCount, lastMessage }` with no customer document, so the
 * customer id is parsed from the thread key.
 */
export function ThreadList({ activeCustomerId, onSelect }) {
  const { data, isLoading, error } = useThreads();
  const threads = data?.threads ?? [];

  if (error) {
    return <p className="px-3 py-8 text-center text-sm text-danger">{error.message}</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <p className="px-3 py-10 text-center text-sm leading-relaxed text-muted-foreground">
        No conversations yet. Messages sent to your business will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {threads.map((thread) => {
        const customerId = customerIdFromThread(thread.threadId);
        if (!customerId) return null;
        const active = customerId === activeCustomerId;
        const last = thread.lastMessage;
        return (
          <li key={thread.threadId}>
            <button
              type="button"
              onClick={() => onSelect?.(customerId)}
              aria-current={active ? "true" : undefined}
              className={`w-full rounded-xl px-3.5 py-3 text-left transition-colors ${
                active ? "bg-accent-light" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-primary">Customer</p>
                {last?.createdAt && (
                  <p className="shrink-0 text-[10px] text-muted-foreground">
                    {formatTime(last.createdAt)}
                  </p>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {last?.text ?? "No messages"}
              </p>
              {typeof thread.messageCount === "number" && (
                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {thread.messageCount} {thread.messageCount === 1 ? "message" : "messages"}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
