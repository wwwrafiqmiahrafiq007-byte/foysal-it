import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import {
  auditLogs,
  authCredentials,
  authTokens,
  emailMessages,
  rateLimitBuckets,
  rolePermissions,
  securitySettings,
  sessions,
  subscriptions,
  users,
  workspaceMembers,
  workspaces,
  plans,
} from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { seedFoysalOsData } from "@/lib/foysal-os";

const SESSION_DAYS = 30;
const TOKEN_BYTES = 32;

export type RegisterInput = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country?: string;
  language?: string;
  timezone?: string;
  workspaceType?: "personal" | "business" | "agency" | "team" | "enterprise";
};

export type LoginInput = {
  email?: string;
  password?: string;
  userAgent?: string;
  ip?: string;
};

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? "";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function addMinutes(minutes: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function publicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
}

function createSecureToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt-sha256$${salt}$${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algo, salt, hash] = storedHash.split("$");
  if (algo !== "scrypt-sha256" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

function safeUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    language: user.language,
    timezone: user.timezone,
    accountStatus: user.accountStatus,
    roleLabel: user.roleLabel,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}

async function recordAudit(values: {
  userId?: string;
  workspaceId?: string;
  eventType: string;
  description: string;
  riskLevel?: string;
  metadata?: Record<string, string | number | boolean>;
}) {
  await db.insert(auditLogs).values({
    userId: values.userId,
    workspaceId: values.workspaceId,
    actorType: "system",
    eventType: values.eventType,
    description: values.description,
    riskLevel: values.riskLevel ?? "low",
    metadata: { secretsDisplayed: false, ...(values.metadata ?? {}) },
  });
}

export async function checkRateLimit(action: string, identifier: string, limit = 6, windowMinutes = 15) {
  const identifierHash = hashValue(identifier || "anonymous");
  const [bucket] = await db
    .select()
    .from(rateLimitBuckets)
    .where(and(eq(rateLimitBuckets.action, action), eq(rateLimitBuckets.identifierHash, identifierHash)));

  const now = new Date();
  if (bucket?.blockedUntil && bucket.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((bucket.blockedUntil.getTime() - now.getTime()) / 1000) };
  }

  if (!bucket) {
    await db.insert(rateLimitBuckets).values({ action, identifierHash, attemptCount: 1, windowStartedAt: now });
    return { allowed: true, retryAfter: 0 };
  }

  const windowExpired = now.getTime() - bucket.windowStartedAt.getTime() > windowMinutes * 60 * 1000;
  const nextCount = windowExpired ? 1 : bucket.attemptCount + 1;
  const blockedUntil = nextCount > limit ? addMinutes(windowMinutes) : null;
  await db
    .update(rateLimitBuckets)
    .set({ attemptCount: nextCount, windowStartedAt: windowExpired ? now : bucket.windowStartedAt, blockedUntil, updatedAt: now })
    .where(eq(rateLimitBuckets.id, bucket.id));

  return { allowed: !blockedUntil, retryAfter: blockedUntil ? windowMinutes * 60 : 0 };
}

export async function registerAccount(input: RegisterInput) {
  await seedFoysalOsData();
  const email = normalizeEmail(input.email);
  const name = input.name?.trim() || "New FOYSAL IT User";
  const password = input.password ?? "";

  if (!email || !email.includes("@")) {
    return { ok: false, status: 400, error: "Valid email is required." };
  }
  if (password.length < 8) {
    return { ok: false, status: 400, error: "Password must be at least 8 characters." };
  }

  const rate = await checkRateLimit("register", email, 4, 30);
  if (!rate.allowed) {
    return { ok: false, status: 429, error: "Too many registration attempts. Try again later.", retryAfter: rate.retryAfter };
  }

  const [existing] = await db.select({ id: users.id, accountStatus: users.accountStatus }).from(users).where(eq(users.email, email));
  if (existing) {
    return { ok: false, status: 409, error: "An account already exists for this email." };
  }

  const [user] = await db
    .insert(users)
    .values({
      displayName: name,
      email,
      phone: input.phone?.trim() || null,
      country: input.country?.trim() || "Bangladesh",
      language: input.language?.trim() || "en",
      timezone: input.timezone?.trim() || "Asia/Dhaka",
      accountStatus: "pending_verification",
      roleLabel: "Agency Owner",
    })
    .returning();

  await db.insert(authCredentials).values({ userId: user.id, passwordHash: createPasswordHash(password), passwordAlgo: "scrypt-sha256" });
  await db.insert(securitySettings).values({ userId: user.id, emailVerified: false, phoneVerified: Boolean(input.phone), passwordReady: true, securityScore: input.phone ? 52 : 42 });

  const verificationToken = createSecureToken();
  const tokenHash = hashValue(verificationToken);
  await db.insert(authTokens).values({
    userId: user.id,
    purpose: "email_verification",
    tokenHash,
    destination: email,
    expiresAt: addDays(2),
  });

  const verificationUrl = `${publicBaseUrl()}/api/auth/verify-email?token=${verificationToken}`;
  await db.insert(emailMessages).values({
    userId: user.id,
    toEmail: email,
    subject: "Verify your FOYSAL IT OS account",
    templateKey: "auth.email_verification",
    status: "queued",
    metadata: { verificationUrl, official: true },
  });
  await db.insert(emailMessages).values({
    userId: user.id,
    toEmail: email,
    subject: "Welcome to FOYSAL IT OS",
    templateKey: "auth.welcome",
    status: "queued",
    metadata: { gettingStarted: true, workspaceCreatedAfterVerification: true },
  });

  await recordAudit({
    userId: user.id,
    eventType: "auth.registration.created",
    description: "Secure account created in pending verification status and official verification/welcome emails were queued.",
    metadata: { autoApprovalRequired: false, plaintextPasswordStored: false },
  });

  return {
    ok: true,
    status: 201,
    user: safeUser(user),
    accountStatus: "pending_verification",
    nextStep: "verify_email_then_auto_activate_workspace_dashboard",
    emailQueued: ["auth.email_verification", "auth.welcome"],
    verificationPreviewUrl: verificationUrl,
    secretsDisplayed: false,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
}

export async function verifyEmailToken(rawToken: string) {
  await seedFoysalOsData();
  const tokenHash = hashValue(rawToken);
  const [token] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.purpose, "email_verification"), isNull(authTokens.usedAt)));

  if (!token || token.expiresAt < new Date()) {
    return { ok: false, status: 400, error: "Verification link is invalid or expired." };
  }

  const [user] = await db.select().from(users).where(eq(users.id, token.userId));
  if (!user) {
    return { ok: false, status: 404, error: "User not found." };
  }

  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, token.id));
  const [activeUser] = await db
    .update(users)
    .set({ accountStatus: "active", emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  await db
    .update(securitySettings)
    .set({ emailVerified: true, passwordReady: true, securityScore: user.phone ? 72 : 62, updatedAt: new Date() })
    .where(eq(securitySettings.userId, user.id));

  const workspaceSlug = `${slugify(user.displayName || "workspace")}-${user.id.slice(0, 8)}`;
  const [workspace] = await db
    .insert(workspaces)
    .values({
      ownerUserId: user.id,
      name: `${user.displayName}'s Workspace`,
      slug: workspaceSlug,
      type: "agency",
      status: "active",
      region: user.country,
      language: user.language,
      timezone: user.timezone,
    })
    .onConflictDoUpdate({
      target: workspaces.slug,
      set: { status: "active", updatedAt: new Date() },
    })
    .returning();

  const [organizationOwnerRole] = await db.select().from(rolePermissions).where(eq(rolePermissions.role, "organization_owner"));
  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: "organization_owner",
    permissions: organizationOwnerRole?.permissions ?? ["workspace.manage", "billing.manage", "crm.manage", "projects.manage", "ai.use"],
  });

  const [freePlan] = await db.select().from(plans).where(eq(plans.code, "free"));
  if (freePlan) {
    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      planId: freePlan.id,
      status: "active",
      renewalState: "free plan",
      currentPeriodEnd: addDays(30),
      paymentProviderRef: null,
    });
  }

  await recordAudit({
    userId: user.id,
    workspaceId: workspace.id,
    eventType: "auth.email_verified.auto_activated",
    description: "Email verified, account activated, workspace initialized, role assigned, and dashboard access unlocked automatically.",
    metadata: { accountStatus: "active", manualApprovalRequired: false },
  });

  return {
    ok: true,
    status: 200,
    user: safeUser(activeUser),
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, status: workspace.status },
    redirectTo: `/dashboard?workspace=${workspace.slug}&welcome=1`,
  };
}

export async function resendVerification(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const rate = await checkRateLimit("resend_verification", email, 3, 15);
  if (!rate.allowed) return { ok: false, status: 429, error: "Please wait before requesting another verification email." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { ok: true, status: 200, message: "If an account exists, a verification email will be sent." };
  if (user.accountStatus === "active") return { ok: true, status: 200, message: "Account is already active." };

  const token = createSecureToken();
  await db.insert(authTokens).values({ userId: user.id, purpose: "email_verification", tokenHash: hashValue(token), destination: email, expiresAt: addDays(2) });
  const verificationUrl = `${publicBaseUrl()}/api/auth/verify-email?token=${token}`;
  await db.insert(emailMessages).values({ userId: user.id, toEmail: email, subject: "Verify your FOYSAL IT OS account", templateKey: "auth.email_verification", status: "queued", metadata: { verificationUrl, resend: true } });
  await recordAudit({ userId: user.id, eventType: "auth.verification_resent", description: "Verification email was resent with a new secure token." });
  return { ok: true, status: 200, message: "Verification email queued.", verificationPreviewUrl: verificationUrl };
}

export async function loginWithPassword(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const rate = await checkRateLimit("login", `${email}:${input.ip ?? "unknown"}`, 8, 15);
  if (!rate.allowed) return { ok: false, status: 429, error: "Too many login attempts. Try again later." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { ok: false, status: 401, error: "Invalid credentials." };

  if (user.accountStatus !== "active") {
    await recordAudit({ userId: user.id, eventType: "auth.login.blocked_status", description: `Login blocked because account status is ${user.accountStatus}.`, riskLevel: "medium" });
    return { ok: false, status: 403, error: "Account is not active. Verify email or complete recovery." };
  }

  const [credential] = await db.select().from(authCredentials).where(eq(authCredentials.userId, user.id));
  if (!credential || !verifyPassword(input.password ?? "", credential.passwordHash)) {
    await recordAudit({ userId: user.id, eventType: "auth.login.failed", description: "Password login failed.", riskLevel: "medium", metadata: { passwordHashExposed: false } });
    return { ok: false, status: 401, error: "Invalid credentials." };
  }

  const workspaceRows = await db
    .select({ workspace: workspaces, membership: workspaceMembers })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id));
  const workspace = workspaceRows.at(0)?.workspace;

  const rawSessionToken = createSecureToken();
  const sessionTokenHash = hashValue(rawSessionToken);
  const suspicious = Boolean(input.userAgent && /curl|bot|spider/i.test(input.userAgent));
  const riskScore = suspicious ? 78 : 12;

  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      workspaceId: workspace?.id,
      sessionTokenHash,
      status: "active",
      ipHash: input.ip ? hashValue(input.ip) : null,
      userAgent: input.userAgent?.slice(0, 300) ?? "Unknown device",
      riskScore,
      suspicious,
      expiresAt: addDays(SESSION_DAYS),
    })
    .returning();

  await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  await recordAudit({
    userId: user.id,
    workspaceId: workspace?.id,
    eventType: suspicious ? "auth.login.suspicious" : "auth.login.success",
    description: suspicious ? "Login succeeded but was flagged for suspicious client characteristics." : "Password login succeeded and a secure session was created.",
    riskLevel: suspicious ? "high" : "low",
  });

  return {
    ok: true,
    status: 200,
    user: safeUser(user),
    workspace: workspace ? { id: workspace.id, name: workspace.name, slug: workspace.slug } : null,
    session: { id: session.id, expiresAt: session.expiresAt, suspicious: session.suspicious, riskScore: session.riskScore },
    rawSessionToken,
    cookieName: "foysal_session",
  };
}

export async function logoutSession(rawSessionToken?: string) {
  if (!rawSessionToken) return { ok: true, status: 200, message: "No active session." };
  const tokenHash = hashValue(rawSessionToken);
  await db.update(sessions).set({ status: "revoked", lastSeenAt: new Date() }).where(eq(sessions.sessionTokenHash, tokenHash));
  return { ok: true, status: 200, message: "Logged out." };
}

export async function requestPasswordReset(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const rate = await checkRateLimit("forgot_password", email, 4, 30);
  if (!rate.allowed) return { ok: false, status: 429, error: "Please wait before requesting another reset link." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return { ok: true, status: 200, message: "If an account exists, a reset email will be sent." };

  const token = createSecureToken();
  const resetUrl = `${publicBaseUrl()}/api/auth/reset-password?token=${token}`;
  await db.insert(authTokens).values({ userId: user.id, purpose: "password_reset", tokenHash: hashValue(token), destination: email, expiresAt: addMinutes(60) });
  await db.insert(emailMessages).values({ userId: user.id, toEmail: email, subject: "Reset your FOYSAL IT OS password", templateKey: "auth.password_reset", status: "queued", metadata: { resetUrl } });
  await recordAudit({ userId: user.id, eventType: "auth.password_reset.requested", description: "Password reset email was queued.", riskLevel: "medium" });
  return { ok: true, status: 200, message: "Reset email queued.", resetPreviewUrl: resetUrl };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  if (newPassword.length < 8) return { ok: false, status: 400, error: "Password must be at least 8 characters." };
  const [token] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, hashValue(rawToken)), eq(authTokens.purpose, "password_reset"), isNull(authTokens.usedAt)));
  if (!token || token.expiresAt < new Date()) return { ok: false, status: 400, error: "Reset link is invalid or expired." };

  await db.update(authCredentials).set({ passwordHash: createPasswordHash(newPassword), passwordUpdatedAt: new Date() }).where(eq(authCredentials.userId, token.userId));
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, token.id));
  await db.update(sessions).set({ status: "force_logged_out", lastSeenAt: new Date() }).where(eq(sessions.userId, token.userId));
  await recordAudit({ userId: token.userId, eventType: "auth.password_reset.completed", description: "Password was reset and existing sessions were force-logged out.", riskLevel: "medium" });
  return { ok: true, status: 200, message: "Password reset complete. Please log in again." };
}

export async function listUserSessions(rawSessionToken?: string) {
  if (!rawSessionToken) return { ok: false, status: 401, error: "Not authenticated." };
  const [session] = await db.select().from(sessions).where(eq(sessions.sessionTokenHash, hashValue(rawSessionToken)));
  if (!session || session.status !== "active" || session.expiresAt < new Date()) return { ok: false, status: 401, error: "Session invalid." };

  const rows = await db
    .select({ id: sessions.id, status: sessions.status, userAgent: sessions.userAgent, riskScore: sessions.riskScore, suspicious: sessions.suspicious, lastSeenAt: sessions.lastSeenAt, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.userId, session.userId));
  return { ok: true, status: 200, sessions: rows, secretsDisplayed: false };
}
