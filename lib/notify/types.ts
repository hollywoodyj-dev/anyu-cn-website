/** V1.2 Priority B — external channel placeholder adapters. */

export type ExternalDeliveryChannel = "email" | "sms" | "push";

/**
 * Adapter outcome (Wisewave V1.2).
 * `blocked_by_consent` is reserved for policy blocks; channel turned off in settings uses skipped + reason.
 */
export type AdapterDeliveryStatus = "sent" | "failed" | "skipped_no_channel" | "blocked_by_consent";

export type ExternalAdapterResult = {
  status: AdapterDeliveryStatus;
  failureReason?: string | null;
};
