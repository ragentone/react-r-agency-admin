import { AppDrawer } from '@ui/patterns';
import React, { useMemo, useState } from 'react';

import { AdminPage } from '../../ui/AdminPage';
import { AdminPanel } from '../../ui/AdminPanel';
import { scrollToMatch } from '../highlight';
import { useActiveSection } from '../hooks/use.active.section';
import { useAdminDocs } from '../hooks/use.admin.docs';
import { useDocSearch } from '../hooks/use.doc.search';
import { renderDocHtml } from '../markdown';
import { indexSections } from '../sections';
import { AdminDocSearchPopover } from './AdminDocSearchPopover';
import { AdminDocSectionsMenu } from './AdminDocSectionsMenu';
import { AdminDocsList } from './AdminDocsList';
import { AdminDocView } from './AdminDocView';

/** `/admin/docs`: the runtime Markdown docs as a list; a tap opens one in the fullscreen drawer. */
export const AdminDocsArea: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { docs, loading, error, reload } = useAdminDocs();
  const active = docs.find(doc => doc.slug === selected);

  const content = active?.content ?? '';
  const indexed = useMemo(() => indexSections(renderDocHtml(content)), [content]);
  const search = useDocSearch(indexed.html, query);
  const activeSection = useActiveSection(
    search.articleRef,
    search.html,
    open && active !== undefined
  );

  const openDoc = (slug: string) => {
    setSelected(slug);
    setOpen(true);
  };
  const close = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };
  // After the dropdown has closed (it returns focus to its trigger first).
  const jumpTo = (id: string) => {
    requestAnimationFrame(() => {
      const target = search.articleRef.current?.querySelector<HTMLElement>(`[id="${id}"]`);
      if (target) scrollToMatch(target);
    });
  };

  return (
    <AdminPage slot="admin-docs">
      <AdminPanel flush={true}>
        <AdminDocsList
          docs={docs}
          loading={loading}
          error={error}
          onOpen={openDoc}
          onRetry={reload}
        />
      </AdminPanel>
      <AppDrawer
        open={open && active !== undefined}
        onOpenChange={close}
        title={active?.title ?? ''}
        description={active?.slug}
        size="fullscreen"
        bodyKey={active?.slug}
        action={
          active ? (
            <>
              <AdminDocSectionsMenu
                sections={indexed.sections}
                activeId={activeSection}
                onSelect={jumpTo}
              />
              <AdminDocSearchPopover
                query={query}
                onQueryChange={setQuery}
                count={search.count}
                index={search.index}
                onPrev={search.prev}
                onNext={search.next}
              />
            </>
          ) : undefined
        }
      >
        {active && <AdminDocView html={search.html} articleRef={search.articleRef} />}
      </AppDrawer>
    </AdminPage>
  );
};
