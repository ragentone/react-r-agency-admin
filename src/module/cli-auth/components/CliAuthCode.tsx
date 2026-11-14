import React from 'react';

interface IProps {
  code: string;
}

/** Terminal-Code groß, in zwei Vierergruppen – gut zu vergleichen mit dem Terminal. */
export const CliAuthCode: React.FC<IProps> = ({ code }) => {
  const [first, second] = code.split('-');
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-muted/40 px-4 py-5">
      <p className="text-caption text-muted-foreground">Code im Terminal</p>
      <p
        aria-label={`Code ${first} ${second}`}
        className="flex items-center gap-3 font-mono text-3xl font-bold tracking-[0.2em] sm:text-4xl"
      >
        <span>{first}</span>
        <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-foreground/30" />
        <span>{second}</span>
      </p>
    </div>
  );
};
