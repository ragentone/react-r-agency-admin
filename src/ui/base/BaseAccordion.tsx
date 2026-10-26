import { useIdGenerator } from '@core/hooks';
import { cn } from '@ui/lib';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ui/shad-cn/components/accordion.tsx';
import { type FunctionComponent, type ReactNode, useEffect, useMemo, useState } from 'react';

import { BaseAccordionContext, type IBaseAccordionContext } from './base-accordion.context.ts';
import { useBaseAccordion } from './use.base-accordion.ts';

export interface IBaseAccordionItemOptions {
  component: FunctionComponent<{ context: IBaseAccordionContext }>;
  key: string;
  label: string;
  className?: string;
  disabled?: boolean;
}

export interface IBaseAccordionItemState {
  open: boolean;
  disabled: boolean;
}

export interface IBaseAccordionItem extends IBaseAccordionItemOptions {
  id: string;
  active: boolean;
  state: IBaseAccordionItemState;
}

interface IProps {
  items: IBaseAccordionItemOptions[];
  defaultValue?: string[];
  multiple?: boolean;
  asCard?: boolean;
  className?: string;
}

interface IPropsItem {
  item: IBaseAccordionItem;
}

type RenderFn = (context: IBaseAccordionContext) => ReactNode;

interface IPropsProvider {
  items: IBaseAccordionItemOptions[];
  children: RenderFn;
  asCard: boolean;
  defaultValue: string[];
}

const BaseAccordionProvider = (props: IPropsProvider) => {
  const { rnd } = useIdGenerator();
  const [values, setValues] = useState<string[]>(() => {
    return props.defaultValue;
  });
  const [items, setItems] = useState<IBaseAccordionItem[]>(() => {
    return props.items.map(item => ({
      ...item,
      id: rnd(8),
      active: true,
      state: {
        open: values.includes(item.key),
        disabled: item.disabled ?? false,
      },
    }));
  });

  const [mounted, setMounted] = useState(false);

  const contextValue = useMemo<IBaseAccordionContext>(() => {
    return {
      items,
      mounted,
      asCard: props.asCard,
      values,
      setValues,
    };
  }, [items, mounted, props.asCard, values]);

  useEffect(() => {
    const init = () => {
      setMounted(true);
    };
    init();
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const init = () => {
      setItems(
        items.map(item => ({
          ...item,
          id: rnd(8),
          active: true,
          state: {
            open: values.includes(item.key),
            disabled: item.state.disabled,
          },
        }))
      );
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <BaseAccordionContext.Provider value={contextValue}>
      {props.children(contextValue)}
    </BaseAccordionContext.Provider>
  );
};

const BaseAccordionItem = ({ item }: IPropsItem) => {
  const context = useBaseAccordion();

  if (!item.active) {
    return null;
  }

  return (
    <>
      <AccordionItem
        disabled={item.state.disabled}
        className={cn(
          'group',
          {
            'shadow-none': true,
            'rounded-2xl': true,
            'border border-border/50': !context.asCard,
            'transition-all duration-200': true,
            'px-3 sm:px-5 py-0.5': true,
            'bg-card/60 hover:bg-card/90': true,
            'rounded-none': context.asCard,
          },
          item.className
        )}
        value={item.key}
        key={item.id}
      >
        <AccordionTrigger
          className={cn({
            'cursor-not-allowed': item.state.disabled,
          })}
        >
          <span
            className={cn({
              'text-muted-foreground': !item.state.open,
            })}
          >
            {item.label}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <item.component context={context} />
        </AccordionContent>
      </AccordionItem>
    </>
  );
};

const BaseAccordion = (props: IProps) => {
  return (
    <BaseAccordionProvider
      asCard={props.asCard ?? false}
      items={props.items}
      defaultValue={props.defaultValue ?? []}
    >
      {context => (
        <Accordion
          value={context.values}
          onValueChange={context.setValues}
          multiple={props.multiple}
          className={cn(
            'flex flex-col gap-2 overflow-hidden',
            {
              'border rounded-2xl': context.asCard,
            },
            props.className
          )}
        >
          {context.items.map(item => (
            <BaseAccordionItem key={item.id} item={item} />
          ))}
        </Accordion>
      )}
    </BaseAccordionProvider>
  );
};

export { BaseAccordion };
