import type { CronFilter, ICronJob } from './types';

export const filterJobs = (jobs: ICronJob[], filter: CronFilter, query: string): ICronJob[] => {
  const needle = query.trim().toLowerCase();
  return jobs.filter(job => {
    if (filter === 'active' && !job.active) return false;
    if (filter === 'inactive' && job.active) return false;
    return !needle || job.name.toLowerCase().includes(needle);
  });
};

/** `1234` → `1.2 s`, `80` → `80 ms`. */
export const formatMs = (ms: number): string =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;

/** ISO string → local `13.11. 09:05`. */
export const dateTime = (value: string): string => {
  const date = new Date(value);
  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
