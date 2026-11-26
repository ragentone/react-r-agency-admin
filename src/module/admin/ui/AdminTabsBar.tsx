import { cn } from '@ui/lib/utils';
import { TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React from 'react';

export interface IAdminTab {
  value: string;
  label: string;
  /** Small count after the label. */
  count?: number;
}

/** Segmented tab switch for the admin pages (full width on phones, compact from `sm`). */
export const AdminTabsBar: React.FC<{
  tabs: IAdminTab[];
  label: string;
  /** Full width on every screen; the tabs share the width and scroll sideways when too narrow. */
  fill?: boolean;
}> = ({ tabs, label, fill = false }) => (
  <TabsList
    aria-label={label}
    className={cn(
      'h-10 w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      !fill && 'sm:w-fit'
    )}
  >
    {tabs.map(tab => (
      <TabsTrigger
        key={tab.value}
        value={tab.value}
        className={cn('h-8 flex-1 px-4 font-semibold', fill ? 'shrink-0' : 'sm:flex-none')}
      >
        {tab.label}
        {tab.count !== undefined && tab.count > 0 && (
          <span className="ml-1.5 text-caption font-normal tabular-nums opacity-70">
            {tab.count}
          </span>
        )}
      </TabsTrigger>
    ))}
  </TabsList>
);
