"use client";

import { useState, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Check,
  ChevronRight,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export interface ProjectItem {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  deadline?: string | Date | null;
  clientId?: string | null;
}

interface ProjectExecutionModuleProps {
  initialProjects: ProjectItem[];
}

export function ProjectExecutionModule({ initialProjects }: ProjectExecutionModuleProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPriority, setNewPriority] = useState<string>("high");
  const [newDeadline, setNewDeadline] = useState("");

  // Confirmation Modal state for destructive/major actions
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "delete_project" | "archive_project" | "reset_progress";
    project: ProjectItem;
  } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Handle Add Project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      status: "in_progress",
      priority: newPriority,
      progress: 10,
      deadline: newDeadline || new Date(Date.now() + 86400000 * 14).toISOString(),
    };

    setProjects((prev) => [created, ...prev]);
    setNewName("");
    setNewDeadline("");
    setShowAddModal(false);
    setActionNotice(`Project "${created.name}" created successfully.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Trigger Confirmation Modal for actions
  const requestDeleteProject = (project: ProjectItem) => {
    setPendingAction({ type: "delete_project", project });
    setModalOpen(true);
  };

  const requestArchiveProject = (project: ProjectItem) => {
    setPendingAction({ type: "archive_project", project });
    setModalOpen(true);
  };

  const requestResetProgress = (project: ProjectItem) => {
    setPendingAction({ type: "reset_progress", project });
    setModalOpen(true);
  };

  // Execute confirmed action
  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { type, project } = pendingAction;

    if (type === "delete_project") {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setActionNotice(`Project track "${project.name}" was permanently deleted.`);
    } else if (type === "archive_project") {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: "completed", progress: 100 } : p))
      );
      setActionNotice(`Project track "${project.name}" archived to completed.`);
    } else if (type === "reset_progress") {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, progress: 0, status: "not_started" } : p))
      );
      setActionNotice(`Milestone progress for "${project.name}" reset to 0%.`);
    }

    setModalOpen(false);
    setPendingAction(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
      case "high":
        return "border-rose-500/30 bg-rose-500/10 text-rose-300";
      case "medium":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "low":
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400/60 hover:text-emerald-300">
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Project Tracks & Delivery</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              {projects.length} Active Tracks
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Milestone execution, progress tracking, and client-linked delivery
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project Track</span>
        </button>
      </div>

      {/* Add Project Form */}
      {showAddModal && (
        <form onSubmit={handleAddProject} className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Create New Project Track</p>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_130px_140px_auto]">
            <input
              type="text"
              placeholder="Project Name (e.g. Enterprise SEO Client Campaign)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            >
              Create Track
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "all", label: "All Projects" },
            { key: "in_progress", label: "In Progress" },
            { key: "review", label: "In Review" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === tab.key
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 rounded-lg border border-slate-800 bg-slate-950/60 py-1 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {filteredProjects.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm font-medium text-slate-400">No project tracks found</p>
            <p className="mt-1 text-xs text-slate-500">Create a new project track to start milestone tracking.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">{proj.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="capitalize">{proj.status.replace("_", " ")}</span>
                    <span>·</span>
                    <span className={`rounded px-1.5 py-0.2 border text-[10px] uppercase font-semibold ${getPriorityStyle(proj.priority)}`}>
                      {proj.priority}
                    </span>
                  </div>
                </div>

                {/* Destructive / Major Action Buttons with Confirmation Modal */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => requestResetProgress(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                    title="Reset progress to 0%"
                    aria-label={`Reset progress for ${proj.name}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestArchiveProject(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition"
                    title="Archive track"
                    aria-label={`Archive project ${proj.name}`}
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDeleteProject(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete project track"
                    aria-label={`Delete project ${proj.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Milestone Progress</span>
                  <span className="font-bold text-indigo-400">{proj.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Deadline & quick update */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : "No deadline"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = proj.progress >= 100 ? 0 : Math.min(100, proj.progress + 25);
                    setProjects((prev) =>
                      prev.map((p) => (p.id === proj.id ? { ...p, progress: next } : p))
                    );
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  +25% Progress
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Project Actions */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          pendingAction?.type === "delete_project"
            ? "Confirm Project Deletion"
            : pendingAction?.type === "reset_progress"
            ? "Confirm Progress Reset"
            : "Archive Project Track"
        }
        message={
          pendingAction?.type === "delete_project"
            ? "Are you sure you want to permanently delete this project track? All associated delivery logs and milestones will be permanently erased."
            : pendingAction?.type === "reset_progress"
            ? "Are you sure you want to reset milestone progress for this project track to 0%?"
            : "Are you sure you want to archive this project track? It will be marked as completed."
        }
        itemName={pendingAction?.project.name}
        itemDetails={
          pendingAction?.project
            ? `Current Progress: ${pendingAction.project.progress}% · Priority: ${pendingAction.project.priority.toUpperCase()}`
            : undefined
        }
        confirmText={
          pendingAction?.type === "delete_project"
            ? "Yes, Delete Project"
            : pendingAction?.type === "reset_progress"
            ? "Reset to 0%"
            : "Yes, Archive Track"
        }
        destructive={pendingAction?.type === "delete_project"}
        actionType={
          pendingAction?.type === "delete_project"
            ? "delete"
            : pendingAction?.type === "reset_progress"
            ? "reset"
            : "archive"
        }
      />
    </div>
  );
}
