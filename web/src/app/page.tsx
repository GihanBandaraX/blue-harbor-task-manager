
// LLM: Displays and manages tasks using the NestJS API.
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListTodo,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

import DashboardSidebar from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type TaskFilter = 'ALL' | TaskStatus;

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const statusStyles: Record<TaskStatus, string> = {
  TODO: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300',
  IN_PROGRESS:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
  DONE: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
};

// Converts an ISO date from the API into a local datetime input value.
function toLocalDateTime(value: string | null) {
  if (!value) return '';

  const date = new Date(value);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return localDate.toISOString().slice(0, 16);
}

// Formats a date and time for display in the task table.
function formatDueDate(value: string | null) {
  if (!value) return 'No due date';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

// Converts API errors into a readable message.
async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    if (typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // Use the fallback message if the response is not JSON.
  }

  return `Request failed (${response.status})`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('ALL');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');

  const [isDark, setIsDark] = useState(false);

  // Loads the user's saved theme when the page opens.
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskora-theme');
    const darkMode = savedTheme === 'dark';

    setIsDark(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  // Changes the theme and remembers the user's selection.
  const toggleTheme = () => {
    const nextTheme = !isDark;

    setIsDark(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme);
    localStorage.setItem('taskora-theme', nextTheme ? 'dark' : 'light');
  };

  // Retrieves the actual task records from the backend.
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/tasks`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load tasks';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // Reads the requested task filter from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedStatus = params.get('status');

    if (
      requestedStatus === 'IN_PROGRESS' ||
      requestedStatus === 'DONE' ||
      requestedStatus === 'TODO'
    ) {
      setActiveFilter(requestedStatus);
    } else {
      setActiveFilter('ALL');
    }
  }, []);

  // Calculates summary values from the real task records.
  const summary = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'TODO').length,
      inProgress: tasks.filter(
        (task) => task.status === 'IN_PROGRESS',
      ).length,
      completed: tasks.filter((task) => task.status === 'DONE').length,
    }),
    [tasks],
  );

  // Applies the selected status and search filters.
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        activeFilter === 'ALL' || task.status === activeFilter;

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description ?? '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  // Clears the form before opening it for a new task.
  const openCreateDialog = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setDueDate('');
    setDialogOpen(true);
  };

  // Loads the selected task into the form for editing.
  const openEditDialog = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setDueDate(toLocalDateTime(task.dueDate));
    setDialogOpen(true);
  };

  // Sends the create or update request to the backend.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingId !== null;
      const endpoint = isEditing
        ? `${API_URL}/tasks/${editingId}`
        : `${API_URL}/tasks`;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const response = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setDialogOpen(false);
      toast.success(isEditing ? 'Task updated successfully' : 'Task created successfully');

      await fetchTasks();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to save task',
      );
    } finally {
      setSaving(false);
    }
  };

  // Confirms deletion before asking the backend to remove a task.
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success('Task deleted successfully');
      await fetchTasks();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to delete task',
      );
    }
  };

  const pageBackground = isDark
    ? 'bg-[#080d19] text-slate-100'
    : 'bg-[#f5f7fc] text-slate-900';

  const panelStyle = isDark
    ? 'border-white/10 bg-slate-900/70'
    : 'border-slate-200/80 bg-white/80';

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${pageBackground}`}>
      <Toaster position="top-right" richColors theme={isDark ? 'dark' : 'light'} />

      <DashboardSidebar />

      <main className="min-w-0 flex-1">
        {/* Page header */}
        <header
          className={`sticky top-0 z-20 flex h-20 items-center justify-between border-b px-5 backdrop-blur-xl sm:px-8 ${
            isDark
              ? 'border-white/10 bg-slate-950/70'
              : 'border-slate-200/80 bg-white/75'
          }`}
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Task Management
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Organise your work and keep things moving.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle light and dark theme"
              className={`rounded-xl ${
                isDark
                  ? 'border-white/15 bg-white/5 text-amber-300 hover:bg-white/10'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              onClick={openCreateDialog}
              className="rounded-xl bg-blue-600 px-4 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl space-y-8 p-5 sm:p-8">
          {/* Summary cards */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Overview</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  A live summary of your saved tasks.
                </p>
              </div>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-300">
                Live data
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className={`rounded-2xl shadow-sm ${panelStyle}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Tasks
                  </CardTitle>
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
                    <ListTodo className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums">
                    {summary.total}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">All saved tasks</p>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl shadow-sm ${panelStyle}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    To Do
                  </CardTitle>
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                    <Clock3 className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums">
                    {summary.todo}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Waiting to start</p>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl shadow-sm ${panelStyle}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    In Progress
                  </CardTitle>
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums">
                    {summary.inProgress}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Currently active</p>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl shadow-sm ${panelStyle}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Completed
                  </CardTitle>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tabular-nums">
                    {summary.completed}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Successfully finished</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Task list */}
          <section
            className={`overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl ${panelStyle}`}
          >
            <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/10 sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold">Your Tasks</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Manage and track your tasks from one place.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search tasks..."
                    className="h-10 rounded-xl border-slate-200 bg-slate-50/80 pl-9 dark:border-white/10 dark:bg-white/5"
                  />
                </div>
              </div>

              {/* Filter navigation */}
              <nav className="flex flex-wrap gap-2">
                {[
                  { label: 'All Tasks', value: 'ALL' as TaskFilter, href: '/tasks' },
                  {
                    label: 'In Progress',
                    value: 'IN_PROGRESS' as TaskFilter,
                    href: '/tasks?status=IN_PROGRESS',
                  },
                  {
                    label: 'Completed',
                    value: 'DONE' as TaskFilter,
                    href: '/tasks?status=DONE',
                  },
                ].map((filter) => (
                  <a
                    key={filter.value}
                    href={filter.href}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      activeFilter === filter.value
                        ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:text-slate-400 dark:hover:text-blue-300'
                    }`}
                  >
                    {filter.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-600" />
                <p className="text-sm">Loading your tasks...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                <AlertCircle className="h-9 w-9 text-rose-500" />
                <p className="font-semibold text-rose-500">
                  Could not load tasks
                </p>
                <p className="max-w-md text-sm text-slate-500">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void fetchTasks()}
                  className="mt-2 rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-blue-500">
                  <ListTodo className="h-8 w-8" />
                </div>
                <h3 className="font-semibold">LLM: No tasks yet</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {searchQuery || activeFilter !== 'ALL'
                    ? 'No tasks match your current search or filter.'
                    : 'Create your first task to start organising your work.'}
                </p>
                {!searchQuery && activeFilter === 'ALL' && (
                  <Button
                    type="button"
                    onClick={openCreateDialog}
                    className="mt-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first task
                  </Button>
                )}
              </div>
            )}

            {/* Real task records */}
            {!loading && !error && filteredTasks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[11px] uppercase tracking-wider text-slate-400 dark:border-white/10">
                      <th className="px-6 py-4 font-semibold">Task</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Due Date & Time</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="transition-colors hover:bg-blue-500/[0.035]"
                      >
                        <td className="max-w-md px-6 py-4">
                          <p className="font-semibold">{task.title}</p>
                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {task.description || 'No description provided'}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Task #{task.id}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[task.status]}`}
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            {formatDueDate(task.dueDate)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(task)}
                              className="rounded-lg border-slate-200 dark:border-white/10 dark:bg-white/5"
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleDelete(task.id)}
                              className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300 dark:hover:bg-rose-400/10"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && filteredTasks.length > 0 && (
              <div className="border-t border-slate-200/70 px-6 py-3 text-xs text-slate-500 dark:border-white/10">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Create and edit task dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) setDialogOpen(open);
        }}
      >
        <DialogContent
          className={`overflow-hidden rounded-3xl border p-0 shadow-2xl backdrop-blur-2xl sm:max-w-[520px] ${
            isDark
              ? 'border-blue-400/25 bg-slate-950/95 text-slate-100 shadow-blue-950/40'
              : 'border-blue-200/80 bg-white/95 text-slate-900 shadow-blue-900/10'
          }`}
        >
          {/* Highlighted dialog header */}
          <div className="relative overflow-hidden border-b border-blue-500/15 px-6 pb-5 pt-6">
            <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-2.5 text-blue-500">
                {editingId ? (
                  <Pencil className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </div>

              <div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingId ? 'Edit Task' : 'Create New Task'}
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {editingId
                    ? 'Update the details of your task.'
                    : 'Add a task and keep your work organised.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-semibold">
                Task title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Complete dashboard design"
                maxLength={100}
                required
                className="h-11 rounded-xl border-slate-200 bg-slate-50/70 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5"
              />
              <p className="text-right text-[11px] text-slate-400">
                {title.length}/100
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-semibold">
                Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add more details about this task..."
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              <p className="text-right text-[11px] text-slate-400">
                {description.length}/500
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="task-status" className="text-sm font-semibold">
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TaskStatus)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="task-due-date" className="text-sm font-semibold">
                  Due date & time
                </label>
                <Input
                  id="task-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/70 text-sm focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200/70 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || !title.trim()}
                className="rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? 'Save Changes' : 'Create Task'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
