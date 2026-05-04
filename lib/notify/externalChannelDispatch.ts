import type { PrismaClient } from "@prisma/client";
import type { FamilyNotificationIntentKind } from "@/lib/child-insights/consentGate";
import { insertNotificationDeliveryAttempt } from "@/lib/child-insights/notificationDeliveryAudit";
import type { ChildSettingsPayload } from "@/lib/child-insights/types";
import { attemptEmailDispatch, attemptPushDispatch, attemptSmsDispatch } from "@/lib/notify/channelAdapters";
import type { ExternalAdapterResult } from "@/lib/notify/types";

type DispatchArgs = {
  elderUserId: string;
  familyNotificationId: string;
  riskLevel: string;
  notificationType: FamilyNotificationIntentKind;
  title: string;
  message: string;
  consentSnapshot: Record<string, unknown>;
  allowedNotificationChannels?: ChildSettingsPayload["allowedNotificationChannels"];
};

async function recordChannel(
  prisma: PrismaClient,
  args: DispatchArgs,
  channel: "email" | "sms" | "push",
  result: ExternalAdapterResult,
): Promise<void> {
  const sentAtIso = result.status === "sent" ? new Date().toISOString() : null;
  await insertNotificationDeliveryAttempt(prisma, {
    elderUserId: args.elderUserId,
    familyNotificationId: args.familyNotificationId,
    riskLevel: args.riskLevel,
    notificationType: args.notificationType,
    contactId: null,
    channel,
    status: result.status,
    intendedTitle: args.title,
    intendedMessage: args.message,
    sentAtIso,
    failureReason: result.failureReason ?? null,
    consentSnapshot: args.consentSnapshot,
  });
}

/**
 * V1.2 Priority B — after in-app `FamilyNotification` insert, evaluate placeholder email/SMS/push adapters
 * and append one `NotificationDeliveryAttempt` row per channel (audit trail).
 */
export async function dispatchExternalNotificationChannels(
  prisma: PrismaClient,
  args: DispatchArgs,
): Promise<void> {
  const ch = args.allowedNotificationChannels ?? {};

  const emailOff = ch.email === false;
  const smsOff = ch.sms === false;
  const pushOff = ch.push === false;

  const emailResult = emailOff
    ? { status: "skipped_no_channel" as const, failureReason: "email_channel_disabled_in_settings" }
    : attemptEmailDispatch();
  await recordChannel(prisma, args, "email", emailResult);

  const smsResult = smsOff
    ? { status: "skipped_no_channel" as const, failureReason: "sms_channel_disabled_in_settings" }
    : attemptSmsDispatch();
  await recordChannel(prisma, args, "sms", smsResult);

  const pushResult = pushOff
    ? { status: "skipped_no_channel" as const, failureReason: "push_channel_disabled_in_settings" }
    : attemptPushDispatch();
  await recordChannel(prisma, args, "push", pushResult);
}
