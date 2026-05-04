import type { ChildSettingsPayload } from "./types";

/** Maps each insert path in `appendFamilyNotificationIfEligible` to a reminder tier / risk gate. */
export type FamilyNotificationIntentKind = "L4_emergency" | "L3_risk" | "watch" | "light";

export type ConsentEvaluationResult = {
  allowed: boolean;
  /** Machine code when `allowed` is false (stored on consent block row). */
  reason?: string;
};

function tierExplicitlyDisabled(
  tiers: { L1?: boolean; L2?: boolean; L3?: boolean; L4?: boolean } | undefined,
  key: "L1" | "L2" | "L3" | "L4",
): boolean {
  if (!tiers) return false;
  return tiers[key] === false;
}

/** Wisewave V1.2: L4 cannot be fully suppressed when emergency contact mode or emergency phone is set. */
function emergencyOverridesL4Lockout(payload: ChildSettingsPayload): boolean {
  if (payload.emergencyContactMode === true) return true;
  if (typeof payload.emergencyContact?.phone === "string" && payload.emergencyContact.phone.trim().length > 0) {
    return true;
  }
  return false;
}

/** At least one contact must be active when contacts exist; missing `active` counts as active. */
function hasActiveRecipient(payload: ChildSettingsPayload): boolean {
  const list = payload.contacts;
  if (!list || list.length === 0) return true;
  return list.some((c) => c.active !== false);
}

/**
 * V1.2 Priority A — consent before creating a family-facing notification row.
 * Omitted fields stay permissive for backward compatibility (same behaviour as pre-V1.2).
 */
export function evaluateFamilyNotificationConsent(
  payload: ChildSettingsPayload,
  kind: FamilyNotificationIntentKind,
): ConsentEvaluationResult {
  if (payload.familyAlertsEnabled === false) {
    return { allowed: false, reason: "family_alerts_disabled" };
  }
  const app = payload.allowedNotificationChannels?.app;
  if (app === false) {
    return { allowed: false, reason: "app_channel_disabled" };
  }
  if (!hasActiveRecipient(payload)) {
    return { allowed: false, reason: "no_active_contact" };
  }

  const tiers = payload.reminderTiers;

  if (kind === "L4_emergency") {
    if (emergencyOverridesL4Lockout(payload)) {
      return { allowed: true };
    }
    if (tierExplicitlyDisabled(tiers, "L4")) {
      return { allowed: false, reason: "reminder_tier_l4_disabled" };
    }
    return { allowed: true };
  }

  if (kind === "L3_risk") {
    if (tierExplicitlyDisabled(tiers, "L3")) {
      return { allowed: false, reason: "reminder_tier_l3_disabled" };
    }
    return { allowed: true };
  }

  if (kind === "watch") {
    if (tierExplicitlyDisabled(tiers, "L2")) {
      return { allowed: false, reason: "reminder_tier_l2_disabled" };
    }
    return { allowed: true };
  }

  if (tierExplicitlyDisabled(tiers, "L1")) {
    return { allowed: false, reason: "reminder_tier_l1_disabled" };
  }
  return { allowed: true };
}

/** Redacted snapshot for audit (no raw chat). */
export function buildConsentSnapshot(payload: ChildSettingsPayload): Record<string, unknown> {
  return {
    familyAlertsEnabled: payload.familyAlertsEnabled !== false,
    allowedNotificationChannels: payload.allowedNotificationChannels ?? { app: true },
    reminderTiers: payload.reminderTiers ?? {},
    emergencyContactMode: payload.emergencyContactMode === true,
    hasEmergencyPhone: Boolean(
      typeof payload.emergencyContact?.phone === "string" && payload.emergencyContact.phone.trim().length > 0,
    ),
    consentAcknowledgedAt: payload.consentAcknowledgedAt ?? null,
    contactCount: payload.contacts?.length ?? 0,
    activeContacts: payload.contacts?.filter((c) => c.active !== false).length ?? 0,
  };
}
