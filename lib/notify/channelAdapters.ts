import type { ExternalAdapterResult } from "@/lib/notify/types";

function envFlag(name: string): boolean {
  return typeof process.env[name] === "string" && process.env[name]!.trim().length > 0;
}

/**
 * Email: no real SMTP send in V1.2. If `ANYU_NOTIFY_EMAIL_ENABLED` is unset, skip; if set, still stub until transport exists.
 */
export function attemptEmailDispatch(): ExternalAdapterResult {
  if (!envFlag("ANYU_NOTIFY_EMAIL_ENABLED")) {
    return { status: "skipped_no_channel", failureReason: "ANYU_NOTIFY_EMAIL_ENABLED unset" };
  }
  return { status: "skipped_no_channel", failureReason: "email_transport_not_implemented_v1_2" };
}

/** SMS: requires explicit enable + carrier keys before any send. */
export function attemptSmsDispatch(): ExternalAdapterResult {
  if (!envFlag("ANYU_NOTIFY_SMS_ENABLED")) {
    return { status: "skipped_no_channel", failureReason: "ANYU_NOTIFY_SMS_ENABLED unset" };
  }
  return { status: "skipped_no_channel", failureReason: "sms_transport_not_implemented_v1_2" };
}

/** Push: FCM/APNs wiring deferred. */
export function attemptPushDispatch(): ExternalAdapterResult {
  if (!envFlag("ANYU_NOTIFY_PUSH_ENABLED")) {
    return { status: "skipped_no_channel", failureReason: "ANYU_NOTIFY_PUSH_ENABLED unset" };
  }
  return { status: "skipped_no_channel", failureReason: "push_transport_not_implemented_v1_2" };
}
