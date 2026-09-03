import { db } from "@/db";
import { knowledgeDocuments } from "@/db/schema";
import { seedFoysalOsData } from "@/lib/foysal-os";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { workspace } = await seedFoysalOsData();
  const documents = await db
    .select()
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.workspaceId, workspace.id))
    .orderBy(asc(knowledgeDocuments.documentType));

  return Response.json({
    ok: true,
    policy: "NOVA retrieves only authorized workspace knowledge and must respect user role, workspace membership, permissions, and document scopes.",
    supportedKnowledge: ["Company Information", "Products", "Services", "Brand Rules", "SOP", "Documents", "FAQs", "Client Instructions", "Project Information"],
    documents,
  });
}
