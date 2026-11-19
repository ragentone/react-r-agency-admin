import { useRoles } from '@core/auth/roles/use.roles.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminRoleUpdate } from '../hooks';
import { AdminPage } from '../ui/AdminPage';
import { AdminPanel } from '../ui/AdminPanel';
import { AdminAdminsView } from './AdminAdminsView';
import { AdminRegistrationView } from './AdminRegistrationView';
import { AdminSelfView } from './AdminSelfView';
import { AdminUsersView } from './AdminUsersView';

const TABS = ['users', 'self', 'registration'] as const;
const ADMINS_TAB = 'admins';

/** `/admin` (user management): segmented tabs "Users | My roles" above one panel. Pages: `AdminPagesArea`. */
export const AdminArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const { saving, update } = useAdminRoleUpdate();
  const { can } = useRoles();
  // Only the super administrator manages the admin accounts.
  const showAdmins = can('super:admin:user');
  const shared = { saving, onUpdate: update };

  return (
    <AdminPage slot="admin">
      <Tabs defaultValue="users" className="flex flex-col gap-4">
        <TabsList aria-label={t('title')} className="h-10 w-full justify-start sm:w-fit">
          {TABS.map(value => (
            <TabsTrigger
              key={value}
              value={value}
              className="h-8 flex-1 px-4 font-semibold sm:flex-none"
            >
              {t(`tabs.${value}`)}
            </TabsTrigger>
          ))}
          {showAdmins && (
            <TabsTrigger value={ADMINS_TAB} className="h-8 flex-1 px-4 font-semibold sm:flex-none">
              {t(`tabs.${ADMINS_TAB}`)}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="users" className="mt-0">
          <AdminPanel flush={true}>
            <AdminUsersView {...shared} />
          </AdminPanel>
        </TabsContent>
        <TabsContent value="self" className="mt-0">
          <AdminPanel flush={true}>
            <AdminSelfView {...shared} />
          </AdminPanel>
        </TabsContent>
        <TabsContent value="registration" className="mt-0">
          <AdminPanel flush={true}>
            <AdminRegistrationView />
          </AdminPanel>
        </TabsContent>
        {showAdmins && (
          <TabsContent value={ADMINS_TAB} className="mt-0">
            <AdminPanel flush={true}>
              <AdminAdminsView {...shared} />
            </AdminPanel>
          </TabsContent>
        )}
      </Tabs>
    </AdminPage>
  );
};
