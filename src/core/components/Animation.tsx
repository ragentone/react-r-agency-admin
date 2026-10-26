import { AnimatePresence, type AnimatePresenceProps, motion } from 'framer-motion';
import type { TargetAndTransition, Transition, VariantLabels } from 'motion-dom';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface IAnimation {
  initial?: TargetAndTransition | VariantLabels | boolean;
  animate?: TargetAndTransition | VariantLabels | boolean;
  exit?: TargetAndTransition | VariantLabels;
  transition?: Transition;
}

export interface IAnimationProps extends HTMLAttributes<unknown> {
  children?: ReactNode;
  active: boolean;
  initial?: IAnimation['initial'];
  animate?: IAnimation['animate'];
  exit?: IAnimation['exit'];
  transition?: IAnimation['transition'];
  handlers?: {
    onEnter?: () => void;
    onLeave?: () => void;
  };

  render?(args: IAnimationRenderArgs): ReactNode;

  className?: string;
  ref?: Ref<HTMLDivElement> | undefined;
  css?: CSSProperties;
  mode?: AnimatePresenceProps['mode'];
  role?: string;
}

export interface IAnimationState {
  enter: boolean;
  leave: boolean;
  active: boolean;
}

export interface IAnimationRenderArgs {
  state: IAnimationState;
}

const Animation = ({
  children,
  active,
  initial,
  animate,
  exit,
  transition,
  handlers = {},
  render,
  className,
  ref,
  css,
  mode,
  role,
}: IAnimationProps) => {
  const activeRef = useRef(active);
  const [state, setState] = useState<IAnimationState>({
    enter: active,
    leave: !active,
    active: active,
  });

  const onComplete = useCallback(() => {
    if (!activeRef.current) return;
    setState(prev => ({ ...prev, enter: true, leave: false }));
    if (!handlers?.onEnter) return;
    handlers.onEnter();
  }, [handlers]);

  const onExit = useCallback(() => {
    setState(prev => ({ ...prev, enter: false, leave: true }));
    if (!handlers?.onLeave) return;
    handlers.onLeave();
  }, [handlers]);

  useEffect(() => {
    const init = () => {
      setState(prev => ({ ...prev, active: active }));
    };
    activeRef.current = active;
    init();
  }, [active]);

  return (
    <AnimatePresence onExitComplete={onExit} mode={mode}>
      {state.active && (
        <motion.div
          role={role}
          ref={ref}
          className={className}
          onAnimationComplete={onComplete}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          style={css}
        >
          {render ? render({ state }) : children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Animation };
