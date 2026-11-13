import React from 'react';

import type { ICronJob } from '../types';
import { CronEmpty } from './CronEmpty';
import { CronRow } from './CronRow';

export const CronList: React.FC<{
  jobs: ICronJob[];
  filtered: boolean;
  onOpen: (job: ICronJob) => void;
}> = ({ jobs, filtered, onOpen }) =>
  jobs.length === 0 ? (
    <CronEmpty filtered={filtered} />
  ) : (
    <ul>
      {jobs.map(job => (
        <CronRow key={job.name} job={job} onOpen={onOpen} />
      ))}
    </ul>
  );
