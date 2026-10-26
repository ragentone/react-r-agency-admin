import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/check')({
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
