import { parse } from 'graphql';

/**
 * Backend: `src/shared/debug` (mutation `debugClientReport`), Kotlin: `DebugLog.kt`.
 */
export const DebugClientReportMutation = parse(`
  mutation DebugClientReport($events: JSON!) {
    debugClientReport(events: $events) {
      success
      accepted
    }
  }
`);
