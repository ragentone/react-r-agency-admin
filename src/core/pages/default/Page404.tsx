import { RoutePage } from '@router/components';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, HelpCircle, Home, RefreshCw, Sparkles } from 'lucide-react';

const Page404 = () => {
  const router = useRouter();

  const handleGoHome = () => {
    void router.navigate({ to: '/' as never });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void router.navigate({ to: '/' as never });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <RoutePage scrollable={true} width="100%" classes={{ scroll: 'py-0' }}>
      <div className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Background ambient decorative glowing orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: [1, 1.1, 1] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: [1, 1.15, 0.95] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs"
          >
            <Sparkles className="size-3.5 animate-pulse text-primary" />
            <span>Error 404</span>
          </motion.div>

          {/* Large Animated 404 Text & Floating Icon */}
          <div className="relative mb-6 select-none">
            <motion.h1
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 120 }}
              className="bg-linear-to-b from-foreground via-foreground/90 to-muted-foreground/30 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl md:text-[11rem]"
            >
              404
            </motion.h1>

            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-4, 4, -4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-background/80 p-3 shadow-xl backdrop-blur-md"
            >
              <Compass className="size-10 text-primary md:size-14" />
            </motion.div>
          </div>

          {/* Heading and Description */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            Lost in uncharted territory?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base"
          >
            The page you are looking for might have been removed, had its name changed, or is
            temporarily unavailable. Don&apos;t worry, we will help you find your way back!
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              onClick={handleGoHome}
              size="lg"
              className="cursor-pointer gap-2 font-medium shadow-md transition-all hover:shadow-lg"
            >
              <Home className="size-4" />
              Take Me Home
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="cursor-pointer gap-2 font-medium transition-all"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>

            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="lg"
              className="cursor-pointer gap-2 font-medium text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-4" />
              Reload Page
            </Button>
          </motion.div>

          {/* Helpful suggestions card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-12 w-full max-w-md rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-xs backdrop-blur-xs sm:p-5"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <HelpCircle className="size-4 text-primary" />
              <span>Helpful hints</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground sm:text-sm">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Double check the web address for any typos.
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Use the main navigation menu to locate your destination.
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Contact support if you believe this is an error.
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </RoutePage>
  );
};

export { Page404 };
