import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { getFoysalOsSnapshot, seedFoysalOsData } from "@/lib/foysal-os";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await seedFoysalOsData();
    const snapshot = await getFoysalOsSnapshot();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "due_date";
    const status = searchParams.get("status");

    let query = db.select().from(tasks).where(eq(tasks.workspaceId, snapshot.workspace.id));
    const allTasks = await query;

    // Apply in-memory sort matching requested options
    const sorted = [...allTasks].sort((a, b) => {
      if (sort === "due_date") {
        const timeA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }
      if (sort === "priority") {
        // Alphabetical sort by priority string (e.g. high, low, medium, urgent)
        return a.priority.localeCompare(b.priority);
      }
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sort === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    const filtered = status && status !== "all" 
      ? sorted.filter((t) => (status === "active" ? t.status !== "completed" : t.status === status))
      : sorted;

    return NextResponse.json({ ok: true, count: filtered.length, tasks: filtered });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await seedFoysalOsData();
    const snapshot = await getFoysalOsSnapshot();
    const body = await request.json();

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "Task title is required" }, { status: 400 });
    }

    const priority = ["urgent", "high", "medium", "low"].includes(body.priority) ? body.priority : "medium";
    const deadline = body.deadline ? new Date(body.deadline) : null;
    let projectId = body.projectId || snapshot.projects.at(0)?.id;
    if (!projectId) {
      const [newProj] = await db
        .insert(projects)
        .values({
          workspaceId: snapshot.workspace.id,
          name: "General Operations",
          status: "in_progress",
        })
        .returning();
      projectId = newProj.id;
    }

    const [created] = await db
      .insert(tasks)
      .values({
        workspaceId: snapshot.workspace.id,
        projectId,
        assignedUserId: snapshot.owner.id,
        title,
        status: "in_progress",
        priority,
        progress: 0,
        deadline,
      })
      .returning();

    return NextResponse.json({ ok: true, task: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, status, priority, progress } = body;

    if (!taskId) {
      return NextResponse.json({ ok: false, error: "taskId is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (status) updatePayload.status = status;
    if (priority) updatePayload.priority = priority;
    if (typeof progress === "number") updatePayload.progress = progress;

    const [updated] = await db
      .update(tasks)
      .set(updatePayload)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, task: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
