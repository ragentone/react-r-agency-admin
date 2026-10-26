import type { IUserAccount } from '@core/account';
import { useEffect } from 'react';

import type { CmsComponent } from '../types.ts';

const CmsTestComponent: CmsComponent<{
  account?: IUserAccount;
}> = props => {
  useEffect(() => {
    props.ready();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={'w-full flex justify-center items-center rounded-2xl h-96 bg-blue-600'}>
      {props.payload?.account?.avatarUrl && (
        <img
          className={'rounded-full size-24 border-2'}
          alt={'avatar'}
          src={props.payload.account.avatarUrl}
        />
      )}
    </div>
  );
};

export { CmsTestComponent };
