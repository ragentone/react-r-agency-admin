import Logo from '@assets/logo.png';
import { parseCssWidthOrHeight } from '@core/utils';
import { cn, renderIcon } from '@ui/lib';
import { Button, type ButtonProps } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { LucideLayoutGrid } from 'lucide-react';
import { type FunctionComponent, useState } from 'react';

interface IMenuItem {
  label?: string;
  icon?: FunctionComponent;
  separator?: boolean;
  groupLabel?: string;
  className?: string;
}

interface IButton {
  icon: FunctionComponent;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  onClick: () => void;
}

interface IPageHeaderProps {
  title?: string;
  description?: string;
  fullWidth?: boolean;
  className?: string;
  showLogo?: boolean;
  menuItems?: IMenuItem[];
  menuButtonVariant?: ButtonProps['variant'];
  menuButtonSize?: ButtonProps['size'];
  buttons?: IButton[];
  logoOnClick?: () => void;
  logoClassName?: string;
}

interface IProps {
  width?: number | string;
}

const PageHeader = (props: IPageHeaderProps & IProps) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const renderItem = (item: IMenuItem, index: number) => {
    if (item.separator)
      return <DropdownMenuSeparator className={cn('border-border/50', item.className)} />;

    if (item.groupLabel) {
      return (
        <DropdownMenuLabel className={cn('text-muted-foreground text-xs', item.className)}>
          {item.groupLabel}
        </DropdownMenuLabel>
      );
    }

    return (
      <DropdownMenuItem
        className={cn('cursor-pointer', item.className)}
        onClick={() => {}}
        key={index}
      >
        <div className={'relative flex gap-2 items-center'}>
          {renderIcon(item.icon)}
          <span>{item.label ?? 'no label'}</span>
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <Item
      variant={'outline'}
      className={cn(
        'py-2 mx-auto rounded-none border-x-0 border-t-0 border-border/50',
        {
          'sm:border-x': !props.fullWidth,
        },
        props.className
      )}
      style={{
        width: props.fullWidth ? '100%' : parseCssWidthOrHeight(props.width, '100%'),
        maxWidth: '100%',
      }}
    >
      {props.showLogo && (
        <ItemMedia variant={'image'}>
          <img
            onClick={props.logoOnClick}
            src={Logo}
            alt="Logo"
            className={cn('h-10 w-10', props.logoClassName)}
          />
        </ItemMedia>
      )}
      <ItemContent className={'gap-0 select-none'}>
        {props.title && <ItemTitle>{props.title}</ItemTitle>}
        {props.description && <ItemDescription>{props.description}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        {props.buttons?.map(button => (
          <Button
            onClick={button.onClick}
            key={button.icon.name}
            variant={button.variant ?? 'ghost'}
            size={button.size}
            className={cn('cursor-pointer')}
          >
            {renderIcon(button.icon)}
          </Button>
        ))}
        {props.menuItems && (
          <DropdownMenu open={menuIsOpen} onOpenChange={setMenuIsOpen}>
            <DropdownMenuTrigger asChild={true}>
              <Button
                className={cn('cursor-pointer', {
                  'animate-pulse': menuIsOpen,
                })}
                variant={props.menuButtonVariant ?? 'ghost'}
                size={props.menuButtonSize}
              >
                <LucideLayoutGrid />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={'min-w-52 max-w-full mx-2'}>
              {props.menuItems?.map((item, index) => {
                return renderItem(item, index);
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ItemActions>
    </Item>
  );
};

export { PageHeader };
export type { IPageHeaderProps };
