declare module 'event/global' {
  export interface ICoreEventMap {
    /** A plugin's home widget was mounted / unmounted. */
    'plugin:slot:mount': { payload: { pluginId: string; slot: string } };
    'plugin:slot:unmount': { payload: { pluginId: string; slot: string } };
    /** After a navigation has finished. */
    'router:navigate:after': { payload: { pathname: string; search: Record<string, unknown> } };
    /** Before a navigation. A plugin can set `data.redirect` (first one wins). */
    'router:navigate:before': {
      payload: { pathname: string; search: Record<string, unknown> };
      data: { redirect?: string };
    };
  }
}
