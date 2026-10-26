import { useAuth } from '@core/auth/components/use.auth.ts';
import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { Button, type ButtonProps } from '@ui/shad-cn/components/button.tsx';
import { User } from 'lucide-react';

interface IProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

const AuthTrigger = (props: IProps) => {
  const { navigate } = useRouter();
  const { userMeta } = useAuth();

  return (
    <Button
      onClick={() => {
        if (userMeta) {
          void navigate({ to: CoreVariables.routePathAccount });
        } else {
          void navigate({ to: CoreVariables.routePathAuth });
        }
      }}
      variant={props.variant}
      size={props.size}
    >
      <User />
    </Button>
  );
};

export { AuthTrigger };
