"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import MessageThread, { ThreadList } from "@/components/Dashboard/MessagesInbox";
import EmptyState from "@/components/Public/EmptyState";

export default function OwnerMessages() {
  const [customerId, setCustomerId] = useState("");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl">Messages</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Conversations with your customers.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside
          className="max-h-[32rem] overflow-y-auto rounded-2xl bg-surface p-2 shadow-card"
          aria-label="Conversations"
        >
          <ThreadList activeCustomerId={customerId} onSelect={setCustomerId} />
        </aside>

        {customerId ? (
          <MessageThread
            customerId={customerId}
            emptyTitle="Conversation"
            emptyDescription="No messages yet with this customer. Send the first one below."
          />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <div>
              <MessageSquare size={28} className="mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-base font-semibold">Choose a conversation</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                Pick a customer from the list to read and reply to their messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
