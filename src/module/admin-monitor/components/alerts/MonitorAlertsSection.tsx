import React from 'react';

/** Titled block: heading outside, content in a bordered card without padding. */
export const MonitorAlertsSection: React.FC<{
  title: string;
  text: string;
  children: React.ReactNode;
}> = ({ title, text, children }) => (
  <section className="flex flex-col gap-2">
    <div className="px-1">
      <h3 className="text-title font-bold">{title}</h3>
      <p className="text-caption text-muted-foreground">{text}</p>
    </div>
    <div className="overflow-hidden rounded-xl border border-border/50">{children}</div>
  </section>
);
