import { parseCssWidthOrHeight } from '@core/utils';
import { cn, renderIcon } from '@ui/lib';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@ui/shad-cn/components/item.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import { type FunctionComponent, type ReactNode, useEffect, useMemo, useState } from 'react';

interface ITabMeta {
  description?: string;
  title?: string;
}

export interface ITab {
  title: string;
  value: string;
  children?: ReactNode;
  render?: (tab: ITabInternal) => ReactNode;
  className?: string;
  scrollable?: boolean;
  icon?: FunctionComponent;
  disabled?: boolean;
  meta?: ITabMeta;
  loading?: boolean;
}

export interface ITabInternal extends ITab {
  id: string;
  index: number;
}

export interface ITabsProps {
  tabs: ITab[];
  value: string;
  onChange?: (tab: ITabInternal) => void;
  height?: string | number;
}

export const AppTabs = ({ tabs, value: valueProp, onChange, height }: ITabsProps) => {
  const internalTabs = useMemo<ITabInternal[]>(
    () => tabs.map((tab, index) => ({ ...tab, id: tab.value, index })),
    [tabs]
  );

  const [value, setValue] = useState<string>(valueProp);

  useEffect(() => {
    const init = () => setValue(valueProp);
    init();
  }, [valueProp]);

  const heightStyle = { height: parseCssWidthOrHeight(height, 'auto') };

  const handleValueChange = (next: string) => {
    setValue(next);
    const tab = internalTabs.find(t => t.value === next);
    if (tab) {
      onChange?.(tab);
    }
  };

  return (
    <Tabs
      value={value}
      onValueChange={handleValueChange}
      className={'relative flex flex-col gap-0'}
      style={heightStyle}
    >
      <TabsList
        className={cn(
          'h-auto w-full shrink-0 justify-start gap-2 overflow-x-auto rounded-none border-b bg-background px-4 py-2',
          'scrollbar-none [&::-webkit-scrollbar]:hidden'
        )}
      >
        {internalTabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              'min-h-9 shrink-0 gap-1.5 rounded-full border border-border px-4 text-sm',
              'bg-background text-foreground hover:bg-muted',
              'data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none',
              'hover:data-[state=active]:bg-foreground/90',
              'cursor-pointer'
            )}
          >
            {tab.icon && renderIcon(tab.icon, { size: 16 })}
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {internalTabs.map(tab => (
        <TabsContent
          key={tab.id}
          value={tab.value}
          className={'relative mt-0 grow overflow-hidden p-0'}
          style={heightStyle}
        >
          {!tab.disabled && (
            <div
              className={cn('relative flex h-full w-full flex-col overflow-hidden', tab.className)}
            >
              {tab.meta && (
                <div className={'relative w-full shrink-0 border-b border-border/50'}>
                  <Item size={'sm'}>
                    <ItemContent className={'gap-0'}>
                      {tab.meta.title && <ItemTitle>{tab.meta.title}</ItemTitle>}
                      {tab.meta.description && (
                        <ItemDescription>{tab.meta.description}</ItemDescription>
                      )}
                    </ItemContent>
                  </Item>
                </div>
              )}
              <div
                className={cn(
                  'relative grow p-4',
                  tab.scrollable ? 'overflow-y-auto' : 'overflow-y-hidden'
                )}
              >
                {tab.render ? tab.render(tab) : tab.children}
              </div>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
