import { RoutePage } from '@router/components';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { FileShareLinkView } from '../components/FileShareLinkView';

/** `/files/s/$token`: public download page of a share link. */
export const PageFileShareLink: React.FC = () => {
  const { token } = useParams({ strict: false }) as { token?: string };
  return (
    <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
      <FileShareLinkView token={token ?? ''} />
    </RoutePage>
  );
};
