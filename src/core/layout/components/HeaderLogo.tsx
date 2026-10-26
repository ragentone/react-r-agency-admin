import Logo from '@assets/logo.png';
import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib';

interface IProps {
  src?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

const HeaderLogo = (props: IProps) => {
  const { navigate } = useRouter();

  return (
    <img
      className={cn(props.className)}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        } else {
          void navigate({ to: CoreVariables.routePathHome });
        }
      }}
      src={props.src ?? Logo}
      alt={props.alt ?? 'Logo'}
    />
  );
};

export { HeaderLogo };
