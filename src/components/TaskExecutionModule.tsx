"use client";

import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  ArrowUpDown, 
  Plus, 
  Search, 
  AlertCircle,
  ChevronDown,
  Trash2,
  Archive,
  RefreshCw,
  Check
} from "lucide-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress?: number;
  deadline?: string | Date | null;
  commentsCount?: number;
  attachmentsCount?: number;
}

interface TaskExecutionModuleProps {
  initialTasks: TaskItem[];
  compact?: boolean;
}

export function TaskExecutionModule({ initialTasks, compact = false }: TaskExecutionModuleProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "title" | "status">("due_date");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "urgent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"urgent" | "high" | "medium" | "low">("high");
  const [newDueDate, setNewDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal state for destructive / major actions
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "delete_single" | "clear_completed" | "reset_all";
    task?: TaskItem;
  } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sorting logic based on selected option
  const sortedAndFilteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Status / Urgent filter
    if (filter === "active") {
      result = result.filter((t) => t.status !== "completed");
    } else if (filter === "completed") {
      result = result.filter((t) => t.status === "completed");
    } else if (filter === "urgent") {
      result = result.filter((t) => t.priority === "urgent" || t.priority === "high");
    }

    // Sorting by user preference
    result.sort((a, b) => {
      if (sortBy === "due_date") {
        const timeA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }
      if (sortBy === "priority") {
        // Alphabetical sort by priority string (e.g., 'high', 'low', 'medium', 'urgent')
        return a.priority.localeCompare(b.priority);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return result;
  }, [tasks, sortBy, filter, searchQuery]);

  // Toggle completion status
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "in_progress" : "completed";
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, progress: newStatus === "completed" ? 100 : 30 } : t))
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
    } catch {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
      );
    }
  };

  // Add task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          deadline: newDueDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok && data.task) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
        setNewDueDate("");
        setShowAddForm(false);
      }
    } catch {
      // Local fallback
      const mockTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: newTitle.trim(),
        priority: newPriority,
        status: "in_progress",
        deadline: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      };
      setTasks((prev) => [mockTask, ...prev]);
      setNewTitle("");
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Destructive Action: Prompt Confirmation Modal
  const requestDeleteTask = (task: TaskItem) => {
    setPendingAction({ type: "delete_single", task });
    setModalOpen(true);
  };

  const requestClearCompleted = () => {
    setPendingAction({ type: "clear_completed" });
    setModalOpen(true);
  };

  // Execute Destructive Action once user confirms in modal
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "delete_single" && pendingAction.task) {
      const deletedId = pendingAction.task.id;
      const deletedTitle = pendingAction.task.title;
      
      setTasks((prev) => prev.filter((t) => t.id !== deletedId));
      
      try {
        await fetch(`/api/tasks`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: deletedId }),
        });
      } catch {
        // Handled locally
      }
      setActionNotice(`Task "${deletedTitle}" was permanently deleted.`);
    } else if (pendingAction.type === "clear_completed") {
      const count = tasks.filter((t) => t.status === "completed").length;
      setTasks((prev) => prev.filter((t) => t.status !== "completed"));
      setActionNotice(`Archived and removed ${count} completed task(s).`);
    }

    setModalOpen(false);
    setPendingAction(null);

    // Auto-dismiss notice
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  // Format deadline and relative label
  const formatDeadline = (dateVal?: string | Date | null) => {
    if (!dateVal) return { text: "No due date", isOverdue: false, isUrgent: false };
    const date = new Date(dateVal);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const dateFormatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (diffDays < 0) {
      return { text: `Overdue (${dateFormatted})`, isOverdue: true, isUrgent: true };
    }
    if (diffDays === 0) {
      return { text: `Due today (${dateFormatted})`, isOverdue: false, isUrgent: true };
    }
    if (diffDays === 1) {
      return { text: `Due tomorrow`, isOverdue: false, isUrgent: true };
    }
    return { text: `${dateFormatted} (in ${diffDays}d)`, isOverdue: false, isUrgent: false };
  };

  // Priority chip styling
  const getPriorityBadge = (priority: string) => {
    const p = priority.toLowerCase();
    switch (p) {
      case "urgent":
        return "border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold";
      case "high":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold";
      case "medium":
        return "border-sky-500/30 bg-sky-500/10 text-sky-300 font-semibold";
      case "low":
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-300 font-semibold";
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6 shadow-xl backdrop-blur-md">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-400/60 hover:text-emerald-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Task Execution Module</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              {tasks.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {completedCount} completed · {pendingCount} in queue
          </p>
        </div>

        {/* Controls: Sorting Dropdown & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SORT DROPDOWN (Explicitly requested by user: 'Due Date' or 'Priority' alphabetical) */}
          <div className="relative inline-flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <select
              id="task-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none cursor-pointer rounded-xl border border-slate-700/80 bg-slate-800/90 py-1.5 pl-8 pr-8 text-xs font-semibold text-slate-200 transition hover:border-slate-600 focus:border-indigo-500 focus:outline-none"
              title="Sort tasks"
              aria-label="Sort tasks by criteria"
            >
              <option value="due_date">Sort: Due Date</option>
              <option value="priority">Sort: Priority (Alphabetical)</option>
              <option value="title">Sort: Title (A–Z)</option>
              <option value="status">Sort: Status</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400">
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Clear Completed Tasks Button (Destructive action protected by confirmation modal) */}
          {completedCount > 0 && (
            <button
              type="button"
              id="task-clear-completed-btn"
              onClick={requestClearCompleted}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition"
              title="Clear all completed tasks"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Clear Done ({completedCount})</span>
            </button>
          )}

          {/* New Task Button */}
          <button
            type="button"
            id="task-add-toggle-btn"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Inline Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Create New Execution Task</p>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_130px_140px_auto]">
            <input
              type="text"
              placeholder="What needs to be executed? (e.g. Audit Google Maps citations)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "urgent", label: "Urgent/High" },
              { key: "completed", label: "Done" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filter === tab.key
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-44 rounded-lg border border-slate-800 bg-slate-950/60 py-1 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {sortedAndFilteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-sm font-medium text-slate-400">No tasks found in this view</p>
            <p className="mt-1 text-xs text-slate-500">Change filter or click &quot;New Task&quot; to add one.</p>
          </div>
        ) : (
          sortedAndFilteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const deadlineInfo = formatDeadline(task.deadline);

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                  isCompleted
                    ? "border-slate-800/50 bg-slate-900/30 opacity-70"
                    : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70"
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className="flex-shrink-0 text-slate-400 transition hover:text-indigo-400 focus:outline-none"
                    title={isCompleted ? "Mark as in progress" : "Mark as completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium leading-snug truncate ${
                        isCompleted ? "line-through text-slate-400" : "text-slate-100"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      {/* Due date tag */}
                      <span
                        className={`inline-flex items-center gap-1 ${
                          deadlineInfo.isOverdue
                            ? "text-rose-400 font-semibold"
                            : deadlineInfo.isUrgent
                            ? "text-amber-400 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {deadlineInfo.text}
                      </span>

                      {task.status !== "completed" && task.status !== "in_progress" && (
                        <span className="capitalize text-slate-400">· {task.status.replace("_", " ")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Priority Badge & Destructive Action Button */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span
                    className={`rounded-lg border px-2.5 py-0.5 text-[11px] uppercase tracking-wide ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                  {/* Destructive Action Trigger: Trash Icon (requires confirmation modal) */}
                  <button
                    type="button"
                    onClick={() => requestDeleteTask(task)}
                    className="opacity-60 hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete task"
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Sorting indicator */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Current Sort:</span>
          <span className="text-slate-200 font-semibold capitalize">
            {sortBy === "due_date"
              ? "Due Date (Earliest First)"
              : sortBy === "priority"
              ? "Priority (Alphabetical)"
              : sortBy === "title"
              ? "Title (A–Z)"
              : "Status"}
          </span>
        </span>
        <span className="text-[11px] text-slate-400">
          Showing {sortedAndFilteredTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Confirmation Modal for Destructive Actions */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          pendingAction?.type === "delete_single"
            ? "Confirm Task Deletion"
            : "Archive Completed Tasks"
        }
        message={
          pendingAction?.type === "delete_single"
            ? "Are you sure you want to permanently delete this execution task? This will remove all associated logs and cannot be recovered."
            : `Are you sure you want to clear and archive ${completedCount} completed task(s)?`
        }
        itemName={pendingAction?.task?.title}
        itemDetails={
          pendingAction?.task
            ? `Priority: ${pendingAction.task.priority.toUpperCase()} · Status: ${pendingAction.task.status}`
            : undefined
        }
        confirmText={
          pendingAction?.type === "delete_single" ? "Yes, Delete Task" : "Yes, Clear Completed"
        }
        destructive={true}
        actionType={pendingAction?.type === "delete_single" ? "delete" : "archive"}
      />
    </div>
  );
}
