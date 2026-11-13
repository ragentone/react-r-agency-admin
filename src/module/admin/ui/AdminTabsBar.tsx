import { TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React from 'react';

export interface IAdminTab {
  value: string;
  label: string;
  /** Small count after the label. */
  count?: number;
}

/** Segmented tab switch for the admin pages (full width on phones, compact from `sm`). */
export const AdminTabsBar: React.FC<{ tabs: IAdminTab[]; label: string }> = ({ tabs, label }) => (
  <TabsList aria-label={label} className="h-10 w-full justify-start overflow-x-auto sm:w-fit">
    {tabs.map(tab => (
      <TabsTrigger
        key={tab.value}
        value={tab.value}
        className="h-8 flex-1 px-4 font-semibold sm:flex-none"
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
