import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/version')({
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
