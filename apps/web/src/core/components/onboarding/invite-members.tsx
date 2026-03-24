"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

type InviteEmail = {
  id: string;
  value: string;
};

export function InviteMembers({ onComplete }: { onComplete: () => void }) {
  const [emails, setEmails] = useState<InviteEmail[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);

  const handleAddEmail = () =>
    setEmails([...emails, { id: crypto.randomUUID(), value: "" }]);
  const handleRemoveEmail = (index: number) =>
    setEmails(emails.filter((_, i) => i !== index));
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = { ...newEmails[index], value };
    setEmails(newEmails);
  };

  const onSubmit = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-txt-primary">
          Invite your team
        </h1>
        <p className="text-sm text-txt-secondary">
          Collaborate with your team members by inviting them.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {emails.map((email, index) => (
          <div key={email.id} className="relative flex items-center">
            <input
              type="email"
              value={email.value}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="colleague@company.com"
              className="input-base w-full pr-10"
            />
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEmail(index)}
                className="absolute right-3 text-txt-placeholder hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddEmail}
          className="flex items-center gap-2 text-xs font-medium text-txt-tertiary hover:text-txt-primary transition-colors w-fit"
        >
          <Plus size={14} /> Add another email
        </button>

        <div className="flex flex-col gap-2 pt-6">
          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary w-full shadow-sm"
          >
            Finish Setup
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="w-full text-xs text-txt-placeholder hover:text-txt-secondary font-medium py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
