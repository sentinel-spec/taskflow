"use client";

export default function WorkspaceBillingSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-txt-tertiary">
        Settings
      </p>
      <h1 className="text-2xl font-semibold text-txt-primary">Billing</h1>
      <div className="rounded-2xl border border-border-subtle bg-white p-6 text-sm text-txt-secondary shadow-sm">
        Billing controls can be connected here (plan, limits, invoices).
      </div>
    </div>
  );
}
