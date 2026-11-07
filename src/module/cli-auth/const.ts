/** Terminal-Freigabe: `runtime connect` öffnet diese Seite mit `?code=XXXX-XXXX`. */
export const CLI_AUTH_ROUTE = '/admin/cli-auth';

/** Erfolgsseite nach der Terminal-Anmeldung. */
export const CLI_AUTH_SUCCESS_ROUTE = '/cli-auth-success';

/** Format wie im Runtime-Store (`BCDFGHJKMNPQRSTVWXZ23456789`, 4-4). */
export const CLI_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** Runtime-Endpunkt: prüft Passwort + Admin-Rolle, gibt den Code für das Terminal frei. */
export const CLI_VERIFY_PATH = '/cli-login/verify';
