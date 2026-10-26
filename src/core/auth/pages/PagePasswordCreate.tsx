import { CreatePasswordForm } from '@core/auth/components/forms/create-password/CreatePasswordForm.tsx';
import { RoutePage } from '@router/components';
import type { IRouteProps } from '@router/types.ts';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const PagePasswordCreate = (
  props: IRouteProps<{
    token?: string;
  }>
) => {
  const { navigate } = useRouter();
  const { t } = useTranslation('auth');

  return (
    <RoutePage width={'100%'} scrollable={true}>
      <div className="mx-auto flex w-full max-w-[440px] flex-col px-5 pt-8 pb-12 sm:pt-16">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="mb-8 size-10 select-none dark:invert"
          draggable={false}
        />
        <h1 className="mb-6 text-[31px] leading-9 font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t('createPasswordForm.title')}
        </h1>
        <CreatePasswordForm
          className="max-w-none"
          onSuccess={async result => {
            if (!result?.success) return;
            await navigate({ to: '/auth' });
          }}
          token={props.data?.token}
        />
      </div>
    </RoutePage>
  );
};

export { PagePasswordCreate };
