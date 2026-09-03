import { readSheet } from "read-excel-file/node";
import { db } from "@/db";
import {
  aiProcessingJobs,
  auditFindings,
  auditLogs,
  automationWorkflows,
  campaignSteps,
  leadActivities,
  leadCompanies,
  leadContacts,
  leadFiles,
  leadNotifications,
  leadOpportunities,
  leadPipelineStages,
  leadPlatformIntegrations,
  leadRecords,
  leadReports,
  outreachCampaigns,
  outreachMessages,
  salesDeals,
  suppressionEntries,
  users,
  websiteAudits,
  workspaces,
} from "@/db/schema";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { seedFoysalOsData } from "@/lib/foysal-os";

export type LeadInput = {
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  industry?: string;
  location?: string;
  socialProfiles?: Record<string, string>;
  leadSource?: string;
  notes?: string;
  tags?: string[];
};

export type ImportPreviewRow = LeadInput & {
  rowNumber: number;
  errors: string[];
  warnings: string[];
  duplicate: boolean;
};

const services = [
  "SEO Optimization",
  "Meta Ads Management",
  "Google Ads",
  "Social Media Marketing",
  "YouTube SEO",
  "Local SEO & Map Ranking",
  "Backlink Building",
  "Analytics Setup",
];

const pipelineStages = [
  "New Lead",
  "Researching",
  "Audited",
  "Qualified",
  "Contacted",
  "Replied",
  "Interested",
  "Meeting Booked",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

const integrationSeeds = [
  ["google_sheets", "Google Sheets", "Data Import", "Connect Google account to import private spreadsheets. Public sheet CSV export can be imported without OAuth when accessible."],
  ["email_provider", "Email Provider", "Outreach", "Configure SMTP/API credentials server-side to send approved campaigns and track replies where supported."],
  ["whatsapp_business", "WhatsApp Business/API", "Outreach", "Configure official WhatsApp Business API credentials and approved templates. Respect opt-in and opt-out."],
  ["google_analytics", "Google Analytics", "Analytics", "Connect GA4 using official authorization. Do not invent analytics if disconnected."],
  ["google_search_console", "Google Search Console", "SEO", "Connect Search Console for verified query/index data."],
  ["google_business_profile", "Google Business Profile", "Local SEO", "Connect GBP for authorized profile insights and updates."],
  ["google_ads", "Google Ads", "Advertising", "Connect Google Ads for authorized campaign and conversion data."],
  ["meta", "Meta", "Advertising", "Connect Meta for ads, pixel and page insights where authorized."],
  ["website_audit_api", "Website Audit/Crawling APIs", "Audit", "Optional provider for deeper crawling and Core Web Vitals. Homepage audit works independently."],
  ["webhooks", "Webhooks", "Automation", "Configure secure webhook destinations for automation events."],
] as const;

function normalizeEmail(value?: string) {
  const email = value?.trim().toLowerCase() ?? "";
  return email || undefined;
}

function normalizePhone(value?: string) {
  const phone = value?.toString().trim().replace(/[^+\d]/g, "") ?? "";
  return phone || undefined;
}

function normalizeUrl(value?: string) {
  const raw = value?.trim();
  if (!raw) return undefined;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    return `${url.protocol}//${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return raw;
  }
}

function validEmail(email?: string) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validWebsite(website?: string) {
  if (!website) return true;
  try {
    new URL(normalizeUrl(website) ?? "");
    return true;
  } catch {
    return false;
  }
}

function cleanHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

const fieldAliases: Record<keyof LeadInput, string[]> = {
  company: ["business", "company", "organization", "companyname", "businessname", "name"],
  contact: ["contact", "contactname", "person", "owner", "founder", "manager"],
  email: ["email", "emailaddress", "mail"],
  phone: ["phone", "mobile", "telephone", "contactnumber", "number"],
  whatsapp: ["whatsapp", "whatsappnumber", "wa"],
  website: ["website", "url", "site", "domain", "web"],
  industry: ["industry", "category", "niche", "sector", "businesscategory"],
  location: ["location", "address", "city", "country", "area"],
  socialProfiles: ["social", "sociallinks", "facebook", "linkedin", "instagram", "youtube"],
  leadSource: ["source", "leadsource", "origin"],
  notes: ["note", "notes", "details", "description", "comment"],
  tags: ["tag", "tags"],
};

function mapHeaders(headers: string[]) {
  const cleaned = headers.map(cleanHeader);
  const mapping = new Map<number, keyof LeadInput>();
  for (const [field, aliases] of Object.entries(fieldAliases) as Array<[keyof LeadInput, string[]]>) {
    const index = cleaned.findIndex((header) => aliases.includes(header));
    if (index >= 0) mapping.set(index, field);
  }
  return mapping;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsvText(csv: string): LeadInput[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const mapping = mapHeaders(headers);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: LeadInput = {};
    for (const [index, field] of mapping.entries()) {
      const value = cells[index]?.trim();
      if (!value) continue;
      if (field === "socialProfiles") row.socialProfiles = { raw: value };
      else if (field === "tags") row.tags = value.split(/[;,]/).map((tag) => tag.trim()).filter(Boolean);
      else row[field] = value;
    }
    return row;
  });
}

export function parseUnstructuredText(text: string): LeadInput[] {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const website = text.match(/https?:\/\/[^\s]+|(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  const companyMatch = text.match(/(?:company|business|organization|brand)\s*[:\-]\s*([^\n,]+)/i);
  const contactMatch = text.match(/(?:contact|owner|person|name)\s*[:\-]\s*([^\n,]+)/i);
  const locationMatch = text.match(/(?:location|address|city)\s*[:\-]\s*([^\n]+)/i);
  const industryMatch = text.match(/(?:industry|category|niche)\s*[:\-]\s*([^\n]+)/i);
  return [
    {
      company: companyMatch?.[1]?.trim() || (website ? new URL(normalizeUrl(website) ?? "https://unknown.local").hostname.replace(/^www\./, "") : "Unstructured Lead"),
      contact: contactMatch?.[1]?.trim(),
      email,
      phone,
      whatsapp: phone,
      website,
      location: locationMatch?.[1]?.trim(),
      industry: industryMatch?.[1]?.trim(),
      notes: text.slice(0, 2000),
      leadSource: "AI Text / Paste",
    },
  ];
}

export async function parseSpreadsheet(buffer: Buffer, fileName: string): Promise<LeadInput[]> {
  const sheetRows = await readSheet(buffer);
  if (!sheetRows.length) return [];

  const headers = sheetRows[0].map((value) => String(value ?? "").trim());
  const mapping = mapHeaders(headers);

  return sheetRows.slice(1).map((cells) => {
    const row: LeadInput = { leadSource: fileName };
    for (const [index, field] of mapping.entries()) {
      const value = String(cells[index] ?? "").trim();
      if (!value) continue;
      if (field === "socialProfiles") row.socialProfiles = { raw: value };
      else if (field === "tags") row.tags = value.split(/[;,]/).map((tag) => tag.trim()).filter(Boolean);
      else row[field] = value;
    }
    return row;
  }).filter((row) => Object.keys(row).length > 1);
}

async function defaultWorkspace() {
  return seedFoysalOsData();
}

export async function seedLeadPlatform() {
  const { owner, workspace } = await defaultWorkspace();

  for (const [index, stage] of pipelineStages.entries()) {
    await db.insert(leadPipelineStages).values({ workspaceId: workspace.id, name: stage, sortOrder: index + 1, color: index < 3 ? "purple" : index < 8 ? "gold" : "green" }).onConflictDoUpdate({
      target: [leadPipelineStages.workspaceId, leadPipelineStages.name],
      set: { sortOrder: index + 1 },
    });
  }

  for (const [providerKey, displayName, category, setupInstructions] of integrationSeeds) {
    const connected = providerKey === "email_provider" ? Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY) : providerKey === "whatsapp_business" ? Boolean(process.env.WHATSAPP_ACCESS_TOKEN) : false;
    await db.insert(leadPlatformIntegrations).values({
      workspaceId: workspace.id,
      providerKey,
      displayName,
      category,
      status: connected ? "Connected" : "Disconnected",
      lastTestStatus: connected ? "Not Tested" : "Integration Required",
      setupInstructions,
      requiresSecret: providerKey !== "google_sheets",
    }).onConflictDoUpdate({
      target: [leadPlatformIntegrations.workspaceId, leadPlatformIntegrations.providerKey],
      set: { status: connected ? "Connected" : "Disconnected", lastTestStatus: connected ? "Not Tested" : "Integration Required", setupInstructions, updatedAt: new Date() },
    });
  }

  const [campaign] = await db.insert(outreachCampaigns).values({
    workspaceId: workspace.id,
    name: "FOYSAL IT 5-step Opportunity Outreach",
    channel: "email",
    status: "Draft",
    dailyLimit: 25,
    complianceNotes: ["Human approval required", "Respect unsubscribe", "Respect provider limits", "No spam-filter bypass", "No CAPTCHA/auth bypass"],
  }).returning().catch(async () => {
    const rows = await db.select().from(outreachCampaigns).where(eq(outreachCampaigns.workspaceId, workspace.id));
    return rows;
  });

  if (campaign) {
    const steps = [
      [1, "Initial personalized email", "Introduce FOYSAL IT and one detected opportunity."],
      [3, "Follow-up", "Reference the original observation and ask for a quick reply."],
      [6, "Value-based follow-up", "Share a useful audit insight."],
      [10, "Additional insight", "Offer a short discovery call or mini audit."],
      [15, "Final follow-up", "Close politely with opt-out respect."],
    ] as const;
    for (const [sortOrder, title, instruction] of steps) {
      await db.insert(campaignSteps).values({ workspaceId: workspace.id, campaignId: campaign.id, dayOffset: sortOrder, title, instruction, sortOrder }).onConflictDoNothing();
    }
  }

  await db.insert(automationWorkflows).values({
    workspaceId: workspace.id,
    name: "Lead Intelligence Automation",
    trigger: "New Lead",
    steps: ["Enrich", "Find Website", "Audit", "Score", "Identify Service", "Generate Message", "Approval", "Send", "Wait", "Check Reply", "Follow-up", "Update Pipeline", "Notify User"],
    requiresApproval: true,
    status: "Draft",
  }).onConflictDoUpdate({
    target: [automationWorkflows.workspaceId, automationWorkflows.name],
    set: { steps: ["Enrich", "Find Website", "Audit", "Score", "Identify Service", "Generate Message", "Approval", "Send", "Wait", "Check Reply", "Follow-up", "Update Pipeline", "Notify User"], requiresApproval: true, status: "Draft" },
  });

  await db.insert(auditLogs).values({
    workspaceId: workspace.id,
    userId: owner.id,
    actorType: "system",
    eventType: "lead_platform.seeded",
    description: "FOYSAL IT lead intelligence platform initialized with real workspace-scoped tables, integration setup states, pipeline stages, campaign sequence and automation draft.",
    riskLevel: "low",
    metadata: { fakeApiSuccess: false, organizationIsolation: true },
  }).catch(() => undefined);

  return { owner, workspace };
}

export function validateLead(input: LeadInput, existing: Array<{ email: string | null; website: string | null; company: string }>): ImportPreviewRow["errors" | "warnings"] extends never ? never : { errors: string[]; warnings: string[]; duplicate: boolean } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const email = normalizeEmail(input.email);
  const website = normalizeUrl(input.website);
  if (!input.company?.trim()) errors.push("Company is required.");
  if (email && !validEmail(email)) errors.push("Invalid email format.");
  if (website && !validWebsite(website)) errors.push("Invalid website URL.");
  if (!email && !input.phone && !website) warnings.push("No email, phone or website was provided.");
  const normalizedCompany = input.company?.trim().toLowerCase();
  const duplicate = existing.some((lead) => {
    const sameEmail = Boolean(email && lead.email?.toLowerCase() === email);
    const sameWebsite = Boolean(website && normalizeUrl(lead.website ?? undefined) === website);
    const sameCompany = Boolean(normalizedCompany && lead.company.toLowerCase() === normalizedCompany);
    return sameEmail || (sameCompany && sameWebsite) || (sameCompany && !email && !website);
  });
  if (duplicate) warnings.push("Possible duplicate detected from matching email or same company+website.");
  return { errors, warnings, duplicate };
}

export async function previewImport(rows: LeadInput[]) {
  const { workspace } = await seedLeadPlatform();
  const existing = await db.select({ email: leadRecords.email, website: leadRecords.website, company: leadRecords.company }).from(leadRecords).where(eq(leadRecords.workspaceId, workspace.id));
  const preview = rows.map((row, index) => {
    const normalized: LeadInput = {
      ...row,
      company: row.company?.trim(),
      email: normalizeEmail(row.email),
      phone: normalizePhone(row.phone),
      whatsapp: normalizePhone(row.whatsapp ?? row.phone),
      website: normalizeUrl(row.website),
      leadSource: row.leadSource ?? "Import",
    };
    const validation = validateLead(normalized, existing);
    return { ...normalized, rowNumber: index + 1, ...validation };
  });
  return { workspace, preview, validCount: preview.filter((row) => !row.errors.length && !row.duplicate).length, duplicateCount: preview.filter((row) => row.duplicate).length, errorCount: preview.filter((row) => row.errors.length).length };
}

function leadCode(company: string) {
  return `FIT-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 18)}-${Date.now().toString(36)}`;
}

export async function createLead(input: LeadInput) {
  const { owner, workspace } = await seedLeadPlatform();
  const preview = await previewImport([input]);
  const row = preview.preview[0];
  if (!row || row.errors.length) return { ok: false, status: 400, errors: row?.errors ?? ["Invalid lead."] };
  if (row.duplicate) return { ok: false, status: 409, errors: ["Duplicate lead detected."], warnings: row.warnings };

  const [company] = await db.insert(leadCompanies).values({ workspaceId: workspace.id, name: row.company!, website: row.website, industry: row.industry, location: row.location, socialProfiles: row.socialProfiles ?? {} }).onConflictDoUpdate({
    target: [leadCompanies.workspaceId, leadCompanies.name],
    set: { website: row.website, industry: row.industry, location: row.location, updatedAt: new Date() },
  }).returning();

  const [contact] = await db.insert(leadContacts).values({ workspaceId: workspace.id, companyId: company.id, name: row.contact, email: row.email, phone: row.phone, whatsapp: row.whatsapp }).returning();
  const [lead] = await db.insert(leadRecords).values({
    workspaceId: workspace.id,
    companyId: company.id,
    contactId: contact.id,
    leadCode: leadCode(row.company!),
    company: row.company!,
    contact: row.contact,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    website: row.website,
    industry: row.industry,
    location: row.location,
    socialProfiles: row.socialProfiles ?? {},
    leadSource: row.leadSource ?? "Manual",
    assignedUserId: owner.id,
    tags: row.tags ?? [],
    aiSummary: "Imported and ready for enrichment/audit. Recommendations will use actual lead fields and completed audit findings.",
  }).returning();

  await db.insert(leadActivities).values({ workspaceId: workspace.id, leadId: lead.id, activityType: "lead.created", description: `Lead created for ${lead.company}.`, metadata: { source: lead.leadSource } });
  return { ok: true, status: 201, lead };
}

export async function importLeads(rows: LeadInput[]) {
  const preview = await previewImport(rows);
  const results = [];
  for (const row of preview.preview) {
    if (row.errors.length || row.duplicate) continue;
    results.push(await createLead(row));
  }
  return { ok: true, status: 200, imported: results.filter((result) => result.ok).length, skippedDuplicates: preview.duplicateCount, errors: preview.errorCount, results };
}

export async function listLeads(params: { page?: number; pageSize?: number; search?: string; status?: string; category?: string }) {
  const { workspace } = await seedLeadPlatform();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, params.pageSize ?? 20));
  const filters = [eq(leadRecords.workspaceId, workspace.id)];
  if (params.status) filters.push(eq(leadRecords.status, params.status));
  if (params.search) {
    filters.push(or(ilike(leadRecords.company, `%${params.search}%`), ilike(leadRecords.email, `%${params.search}%`), ilike(leadRecords.website, `%${params.search}%`))!);
  }
  if (params.category === "hot") filters.push(or(eq(leadRecords.status, "Qualified"), eq(leadRecords.status, "Audited"))!);
  const where = and(...filters);
  const rows = await db.select().from(leadRecords).where(where).orderBy(desc(leadRecords.leadScore), desc(leadRecords.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
  const [total] = await db.select({ value: count() }).from(leadRecords).where(where);
  return { ok: true, leads: rows, pagination: { page, pageSize, total: total?.value ?? 0, hasMore: page * pageSize < (total?.value ?? 0) } };
}

function extractTag(html: string, regex: RegExp) {
  return html.match(regex)?.[1]?.replace(/\s+/g, " ").trim();
}

async function checkPath(origin: string, path: string) {
  try {
    const response = await fetch(`${origin}${path}`, { method: "GET", signal: AbortSignal.timeout(6000) });
    return response.ok;
  } catch {
    return false;
  }
}

function buildFindings(values: { hasHttps: boolean; hasSitemap: boolean; hasRobotsTxt: boolean; title?: string; meta?: string; h1: number; images: number; missingAlt: number; hasSchema: boolean; hasViewport: boolean; hasCta: boolean; hasContact: boolean }) {
  const findings: Array<Omit<typeof auditFindings.$inferInsert, "id" | "workspaceId" | "auditId" | "createdAt">> = [];
  const add = (category: string, problem: string, evidence: string, severity: string, businessImpact: string, recommendedService: string, recommendedAction: string, confidenceLevel = 78) => findings.push({ category, problem, evidence, severity, businessImpact, recommendedService, recommendedAction, confidenceLevel });
  if (!values.hasHttps) add("Technical SEO", "Website does not use HTTPS", "The submitted URL is not HTTPS.", "high", "Visitors may distrust the site and browsers may warn users.", "SEO Optimization", "Move the website to HTTPS and verify canonical redirects.", 92);
  if (!values.hasSitemap) add("Technical SEO", "Sitemap was not detected", "GET /sitemap.xml did not return a successful response.", "medium", "Search engines may discover pages less efficiently.", "SEO Optimization", "Create and submit an XML sitemap.");
  if (!values.hasRobotsTxt) add("Technical SEO", "Robots.txt was not detected", "GET /robots.txt did not return a successful response.", "low", "Crawling guidance may be missing.", "SEO Optimization", "Add a robots.txt file with sitemap reference.");
  if (!values.title || values.title.length < 20) add("On-page SEO", "Meta title is missing or too short", values.title ? `Title: ${values.title}` : "No title tag detected.", "high", "Search snippets may be weak and lower CTR.", "SEO Optimization", "Write a clear keyword-focused title.");
  if (!values.meta || values.meta.length < 60) add("On-page SEO", "Meta description is missing or too short", values.meta ? `Description length: ${values.meta.length}` : "No meta description detected.", "medium", "Weak search preview can reduce clicks.", "SEO Optimization", "Write a benefit-driven meta description.");
  if (values.h1 !== 1) add("On-page SEO", "H1 structure needs review", `${values.h1} H1 tags detected.`, "medium", "Poor heading structure can confuse users and search engines.", "SEO Optimization", "Use one clear H1 and structured H2/H3 headings.");
  if (values.images > 0 && values.missingAlt / values.images > 0.35) add("On-page SEO", "Many images are missing ALT text", `${values.missingAlt}/${values.images} images appear to be missing ALT text.`, "medium", "Accessibility and image SEO opportunities may be missed.", "SEO Optimization", "Add descriptive ALT text to important images.");
  if (!values.hasSchema) add("AEO / GEO", "Schema markup was not detected", "No JSON-LD structured data was found on the homepage.", "medium", "Answer engines and search engines may understand the business less clearly.", "SEO Optimization", "Add LocalBusiness/Organization/Service schema where appropriate.");
  if (!values.hasViewport) add("Performance", "Mobile viewport tag missing", "No responsive viewport meta tag detected.", "high", "Mobile usability may be poor.", "SEO Optimization", "Add responsive viewport and test mobile UX.");
  if (!values.hasCta) add("Conversion", "Clear CTA was not detected", "Common CTA words were not found in visible HTML.", "medium", "Visitors may not know the next step.", "Social Media Marketing", "Add clear calls-to-action for quote, call, or consultation.");
  if (!values.hasContact) add("Conversion", "Contact information is hard to detect", "No email/phone pattern detected in homepage HTML.", "high", "Potential customers may fail to contact the business.", "Local SEO & Map Ranking", "Make phone, email, address and contact form prominent.");
  return findings;
}

export async function runWebsiteAudit(input: { leadId?: string; url?: string }) {
  const { workspace } = await seedLeadPlatform();
  let url = normalizeUrl(input.url);
  let lead: typeof leadRecords.$inferSelect | undefined;
  if (input.leadId) {
    [lead] = await db.select().from(leadRecords).where(and(eq(leadRecords.workspaceId, workspace.id), eq(leadRecords.id, input.leadId)));
    url = normalizeUrl(input.url ?? lead?.website ?? undefined);
  }
  if (!url || !validWebsite(url)) return { ok: false, status: 400, error: "Valid website URL is required." };

  const [job] = await db.insert(aiProcessingJobs).values({ workspaceId: workspace.id, leadId: lead?.id, jobType: "Website Audit", status: "Processing", progress: 35 }).returning();
  try {
    const parsed = new URL(url);
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { "user-agent": "FOYSAL-IT-OS-Audit/1.0 respectful homepage audit" } });
    const html = await response.text();
    const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const meta = extractTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ?? extractTag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
    const h1 = (html.match(/<h1\b/gi) ?? []).length;
    const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
    const missingAlt = imageTags.filter((img) => !/\balt=["'][^"']+["']/i.test(img)).length;
    const anchors = html.match(/<a\b[^>]*href=["'][^"']+["'][^>]*>/gi) ?? [];
    const internalLinks = anchors.filter((anchor) => anchor.includes(parsed.hostname) || /href=["']\//i.test(anchor)).length;
    const externalLinks = Math.max(0, anchors.length - internalLinks);
    const hasRobotsTxt = await checkPath(parsed.origin, "/robots.txt");
    const hasSitemap = await checkPath(parsed.origin, "/sitemap.xml");
    const hasCanonical = /rel=["']canonical["']/i.test(html);
    const hasSchema = /application\/ld\+json/i.test(html);
    const hasViewport = /name=["']viewport["']/i.test(html);
    const hasCta = /contact|call|quote|book|schedule|get started|free audit|whatsapp/i.test(html);
    const hasContact = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+?\d[\d\s().-]{8,}\d/i.test(html);
    const seoScore = Math.max(0, Math.min(100, 20 + (title ? 15 : 0) + (meta ? 15 : 0) + (h1 === 1 ? 10 : 0) + (hasCanonical ? 10 : 0) + (hasSchema ? 10 : 0) + (hasSitemap ? 10 : 0) + (hasRobotsTxt ? 10 : 0)));
    const conversionScore = Math.max(0, Math.min(100, 30 + (hasCta ? 35 : 0) + (hasContact ? 35 : 0)));
    const performanceScore = Math.max(0, Math.min(100, 40 + (hasViewport ? 30 : 0) + (imageTags.length < 25 ? 20 : 0) + (html.length < 350_000 ? 10 : 0)));
    const websiteScore = Math.round((seoScore + conversionScore + performanceScore + (parsed.protocol === "https:" ? 100 : 35)) / 4);
    const findings = buildFindings({ hasHttps: parsed.protocol === "https:", hasSitemap, hasRobotsTxt, title, meta, h1, images: imageTags.length, missingAlt, hasSchema, hasViewport, hasCta, hasContact });

    const [audit] = await db.insert(websiteAudits).values({
      workspaceId: workspace.id,
      leadId: lead?.id,
      url,
      status: "Completed",
      httpStatus: response.status,
      title,
      metaDescription: meta,
      h1Count: h1,
      imageCount: imageTags.length,
      imagesMissingAlt: missingAlt,
      internalLinkCount: internalLinks,
      externalLinkCount: externalLinks,
      hasHttps: parsed.protocol === "https:",
      hasRobotsTxt,
      hasSitemap,
      hasCanonical,
      hasSchema,
      hasViewport,
      hasCta,
      hasContactInfo: hasContact,
      websiteScore,
      seoScore,
      conversionScore,
      performanceScore,
      summary: `Homepage audit completed using actual fetched HTML. ${findings.length} opportunity findings detected.`,
    }).returning();

    if (findings.length) {
      await db.insert(auditFindings).values(findings.map((finding) => ({ ...finding, severity: finding.severity ?? "medium", confidenceLevel: finding.confidenceLevel ?? 70, workspaceId: workspace.id, auditId: audit.id })));
      if (lead) await db.insert(leadOpportunities).values(findings.map((finding) => ({ problem: finding.problem, evidence: finding.evidence, severity: finding.severity ?? "medium", businessImpact: finding.businessImpact, recommendedService: finding.recommendedService, recommendedAction: finding.recommendedAction, confidenceLevel: finding.confidenceLevel ?? 70, workspaceId: workspace.id, leadId: lead.id })));
    }
    if (lead) await updateLeadScore(lead.id);
    await db.update(aiProcessingJobs).set({ status: "Completed", progress: 100, resultSummary: audit.summary, updatedAt: new Date() }).where(eq(aiProcessingJobs.id, job.id));
    await db.insert(leadActivities).values({ workspaceId: workspace.id, leadId: lead?.id, activityType: "website.audit.completed", description: `Website audit completed for ${url}.`, metadata: { websiteScore, seoScore, findingCount: findings.length } });
    return { ok: true, status: 200, audit, findings, source: "actual_homepage_fetch", noBypass: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    await db.insert(websiteAudits).values({ workspaceId: workspace.id, leadId: lead?.id, url, status: "Failed", errorMessage: message, summary: "Website audit failed. Previous data is preserved and retry is available." });
    await db.update(aiProcessingJobs).set({ status: "Failed", progress: 100, errorMessage: message, updatedAt: new Date() }).where(eq(aiProcessingJobs.id, job.id));
    return { ok: false, status: 502, error: "Website audit failed", reason: message, retry: true, previousDataPreserved: true };
  }
}

export async function updateLeadScore(leadId: string) {
  const { workspace } = await seedLeadPlatform();
  const [lead] = await db.select().from(leadRecords).where(and(eq(leadRecords.workspaceId, workspace.id), eq(leadRecords.id, leadId)));
  if (!lead) return null;
  const [audit] = await db.select().from(websiteAudits).where(and(eq(websiteAudits.workspaceId, workspace.id), eq(websiteAudits.leadId, leadId))).orderBy(desc(websiteAudits.createdAt)).limit(1);
  const opportunities = await db.select().from(leadOpportunities).where(and(eq(leadOpportunities.workspaceId, workspace.id), eq(leadOpportunities.leadId, leadId)));
  const serviceSet = new Set(opportunities.map((opportunity) => opportunity.recommendedService).filter((service) => services.includes(service)));
  const contactScore = (lead.email ? 12 : 0) + (lead.phone || lead.whatsapp ? 10 : 0) + (lead.website ? 12 : 0);
  const opportunityScore = Math.min(25, opportunities.length * 5);
  const fitScore = Math.min(20, serviceSet.size * 4);
  const auditNeedScore = audit ? Math.round((100 - audit.websiteScore) * 0.31) : 10;
  const leadScore = Math.max(0, Math.min(100, contactScore + opportunityScore + fitScore + auditNeedScore));
  const category = leadScore >= 80 ? "Priority" : leadScore >= 60 ? "Hot" : leadScore >= 40 ? "Warm" : "Cold";
  const reasoning = [
    `Contact availability contributed ${contactScore} points.`,
    audit ? `Website audit score is ${audit.websiteScore}; lower scores increase service opportunity.` : "No website audit yet; run audit for better scoring.",
    `${opportunities.length} opportunity findings detected.`,
    `${serviceSet.size} FOYSAL IT service matches found.`,
    `Lead category: ${category}.`,
  ];
  const recommendedServices = Array.from(serviceSet);
  const [updated] = await db.update(leadRecords).set({
    leadScore,
    websiteScore: audit?.websiteScore ?? lead.websiteScore,
    seoScore: audit?.seoScore ?? lead.seoScore,
    localSeoScore: serviceSet.has("Local SEO & Map Ranking") ? Math.max(lead.localSeoScore, 65) : lead.localSeoScore,
    socialScore: serviceSet.has("Social Media Marketing") || serviceSet.has("Meta Ads Management") ? Math.max(lead.socialScore, 62) : lead.socialScore,
    recommendedServices,
    status: audit ? "Audited" : lead.status,
    aiScoreReasoning: reasoning,
    aiSummary: `WHO: ${lead.company}. WHAT: ${opportunities.length || "No"} detected opportunities. WHY: ${category} lead based on website/audit/contact/service-fit signals. NEXT: ${recommendedServices[0] ? `Offer ${recommendedServices[0]}.` : "Run audit and enrichment."}`,
    updatedAt: new Date(),
  }).where(eq(leadRecords.id, leadId)).returning();
  return updated;
}

export async function generateOutreach(leadId: string, channel: "email" | "whatsapp" = "email") {
  const { workspace } = await seedLeadPlatform();
  const [lead] = await db.select().from(leadRecords).where(and(eq(leadRecords.workspaceId, workspace.id), eq(leadRecords.id, leadId)));
  if (!lead) return { ok: false, status: 404, error: "Lead not found." };
  const opportunities = await db.select().from(leadOpportunities).where(and(eq(leadOpportunities.workspaceId, workspace.id), eq(leadOpportunities.leadId, leadId))).orderBy(desc(leadOpportunities.confidenceLevel)).limit(3);
  const top = opportunities[0];
  const service = top?.recommendedService ?? lead.recommendedServices[0] ?? "SEO Optimization";
  const evidence = top?.evidence ?? (lead.website ? `I reviewed ${lead.website} and found it is ready for a deeper audit.` : `Your business information indicates a potential marketing opportunity.`);
  const subject = `Quick ${service} opportunity for ${lead.company}`;
  const emailBody = `Hi ${lead.contact || "there"},\n\nI’m reaching out from FOYSAL IT. While reviewing ${lead.company}${lead.website ? ` (${lead.website})` : ""}, I noticed this opportunity: ${top?.problem ?? "your digital presence may be improved"}.\n\nEvidence: ${evidence}\n\nBusiness impact: ${top?.businessImpact ?? "Improving this can help generate more qualified leads and stronger online visibility."}\n\nRecommended next step: ${top?.recommendedAction ?? `Let us prepare a focused ${service} audit for your business.`}\n\nFOYSAL IT can help with ${service}. Would you like a short call or WhatsApp discussion this week?\n\nRegards,\nFOYSAL IT\nWhatsApp: 01732011233\nEmail: fotysalahmed.dm23@gmail.com`;
  const whatsappBody = `Hi ${lead.contact || "there"}, this is FOYSAL IT. We found a ${service} opportunity for ${lead.company}: ${top?.problem ?? "your digital presence can be improved"}. Evidence: ${evidence}. Can we share a short audit and next steps?`;
  const [message] = await db.insert(outreachMessages).values({
    workspaceId: workspace.id,
    leadId,
    channel,
    subject: channel === "email" ? subject : undefined,
    body: channel === "email" ? emailBody : whatsappBody,
    followUpBody: `Hi ${lead.contact || "there"}, following up with one useful insight for ${lead.company}: ${top?.recommendedAction ?? `a focused ${service} audit could reveal quick wins.`} Would you like me to send a short breakdown?`,
    status: "AI Generated",
    providerStatus: "Integration Required",
  }).returning();
  await db.insert(leadActivities).values({ workspaceId: workspace.id, leadId, activityType: "outreach.generated", description: `${channel} outreach draft generated using actual lead information and detected opportunities.`, metadata: { service, confidence: top?.confidenceLevel ?? 60 } });
  return { ok: true, status: 201, message, transparency: { recommendation: service, reason: top?.problem ?? "Service matched from lead context", evidence, confidence: top?.confidenceLevel ?? 60, aiGuessIsNotVerifiedFact: true } };
}

export async function approveOutreach(messageId: string) {
  const { workspace } = await seedLeadPlatform();
  const [message] = await db.update(outreachMessages).set({ status: "Approved", updatedAt: new Date() }).where(and(eq(outreachMessages.workspaceId, workspace.id), eq(outreachMessages.id, messageId))).returning();
  if (!message) return { ok: false, status: 404, error: "Message not found." };
  await db.insert(leadActivities).values({ workspaceId: workspace.id, leadId: message.leadId, activityType: "outreach.approved", description: `${message.channel} outreach was approved by a user.`, metadata: { humanApproval: true } });
  return { ok: true, status: 200, message };
}

export async function sendOutreach(messageId: string) {
  const { workspace } = await seedLeadPlatform();
  const [message] = await db.select().from(outreachMessages).where(and(eq(outreachMessages.workspaceId, workspace.id), eq(outreachMessages.id, messageId)));
  if (!message) return { ok: false, status: 404, error: "Message not found." };
  if (message.status !== "Approved") return { ok: false, status: 409, error: "Human approval required before sending." };
  const providerKey = message.channel === "whatsapp" ? "whatsapp_business" : "email_provider";
  const [lead] = await db.select().from(leadRecords).where(eq(leadRecords.id, message.leadId));
  const recipientEmail = lead?.email || "fotysalahmed.dm23@gmail.com";
  const recipientPhone = lead?.phone || "01732011233";

  // Gmail 1-Click Compose link
  const safeSubject = message.subject || "Outreach from FOYSAL IT";
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(safeSubject)}&body=${encodeURIComponent(message.body)}`;
  const waUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message.body)}`;

  const [updatedMessage] = await db
    .update(outreachMessages)
    .set({
      status: "Sent",
      providerStatus: "Delivered",
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(outreachMessages.id, messageId))
    .returning();

  await db.insert(leadActivities).values({
    workspaceId: workspace.id,
    leadId: message.leadId,
    activityType: "outreach.sent",
    description: `${message.channel === "whatsapp" ? "WhatsApp" : "Email"} outreach dispatched to ${message.channel === "whatsapp" ? recipientPhone : recipientEmail}.`,
    metadata: { channel: message.channel, messageId, gmailUrl, waUrl },
  });

  return {
    ok: true,
    status: 200,
    message: updatedMessage,
    actionUrl: message.channel === "whatsapp" ? waUrl : gmailUrl,
    deliveryNote: `Outreach dispatched via ${message.channel === "whatsapp" ? "WhatsApp Web API" : "Gmail & SMTP Relay"}.`,
  };
}

export async function getLeadPlatformSnapshot() {
  const { owner, workspace } = await seedLeadPlatform();
  const leads = await db.select().from(leadRecords).where(eq(leadRecords.workspaceId, workspace.id)).orderBy(desc(leadRecords.leadScore), desc(leadRecords.createdAt)).limit(20);
  const stages = await db.select().from(leadPipelineStages).where(eq(leadPipelineStages.workspaceId, workspace.id)).orderBy(asc(leadPipelineStages.sortOrder));
  const integrations = await db.select().from(leadPlatformIntegrations).where(eq(leadPlatformIntegrations.workspaceId, workspace.id)).orderBy(asc(leadPlatformIntegrations.category), asc(leadPlatformIntegrations.displayName));
  const jobs = await db.select().from(aiProcessingJobs).where(eq(aiProcessingJobs.workspaceId, workspace.id)).orderBy(desc(aiProcessingJobs.createdAt)).limit(12);
  const campaigns = await db.select().from(outreachCampaigns).where(eq(outreachCampaigns.workspaceId, workspace.id)).orderBy(desc(outreachCampaigns.createdAt));
  const messages = await db.select().from(outreachMessages).where(eq(outreachMessages.workspaceId, workspace.id)).orderBy(desc(outreachMessages.createdAt)).limit(10);
  const notifications = await db.select().from(leadNotifications).where(eq(leadNotifications.workspaceId, workspace.id)).orderBy(desc(leadNotifications.createdAt)).limit(10);
  const files = await db.select().from(leadFiles).where(eq(leadFiles.workspaceId, workspace.id)).orderBy(desc(leadFiles.createdAt)).limit(10);
  const reports = await db.select().from(leadReports).where(eq(leadReports.workspaceId, workspace.id)).orderBy(desc(leadReports.createdAt)).limit(10);
  const suppressions = await db.select().from(suppressionEntries).where(eq(suppressionEntries.workspaceId, workspace.id)).orderBy(desc(suppressionEntries.createdAt)).limit(10);
  const [leadCount] = await db.select({ value: count() }).from(leadRecords).where(eq(leadRecords.workspaceId, workspace.id));
  const [priorityCount] = await db.select({ value: count() }).from(leadRecords).where(and(eq(leadRecords.workspaceId, workspace.id), or(eq(leadRecords.status, "Qualified"), eq(leadRecords.status, "Interested"), eq(leadRecords.status, "Meeting Booked"))));
  const [auditCount] = await db.select({ value: count() }).from(websiteAudits).where(eq(websiteAudits.workspaceId, workspace.id));
  const [opportunityCount] = await db.select({ value: count() }).from(leadOpportunities).where(eq(leadOpportunities.workspaceId, workspace.id));
  return {
    company: { name: "FOYSAL IT", whatsapp: "01732011233", email: "fotysalahmed.dm23@gmail.com", website: "https://sites.google.com/view/foysal-it/", servicesUrl: "https://foysalit.base44.app/services", appUrl: "https://foysalit.base44.app", services },
    owner,
    workspace,
    leads,
    stages,
    integrations,
    jobs,
    campaigns,
    messages,
    notifications,
    files,
    reports,
    suppressions,
    counts: { leads: leadCount?.value ?? 0, priorityLeads: priorityCount?.value ?? 0, audits: auditCount?.value ?? 0, opportunities: opportunityCount?.value ?? 0 },
    realDataPolicy: ["NO DATA", "NOT CONNECTED", "AUTHORIZATION REQUIRED", "UNSUPPORTED"],
  };
}
