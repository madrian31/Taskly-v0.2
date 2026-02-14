import React, { useState } from 'react';
import { Task, Attachment, DifficultyEmoji, CompletionMoodEmoji, DIFFICULTY_OPTIONS, MOOD_OPTIONS } from '../../../../../model/Task';
import { TaskStatus } from '../../../../../model/Task';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Calendar,
    Flag,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    MoreVertical,
    Pencil,
    Trash
} from 'lucide-react';

interface Props {
    filteredTasks: Task[];
    subtasks: { [key: string]: Task[] };
    loading: boolean;
    isMobileView: boolean;
    expandedTasks: Set<string>;
    openDropdownId: string | null;
    activeFilter: string;
    toggleTaskExpansion: (taskId: string) => void;
    toggleDropdown: (taskId: string) => void;
    closeDropdown: () => void;
    openModal: (parentId?: string) => void;
    openEditModal: (task: Task) => void;
    deleteTask: (id: string) => Promise<void>;
    toggleTaskCompletion: (id: string, isSubtask?: boolean) => Promise<void>;
    updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
    updateTaskEmoji: (taskId: string, field: 'difficulty_emoji' | 'completion_mood', value: DifficultyEmoji | CompletionMoodEmoji | null) => Promise<void>;
    formatDueDate: (d?: Date) => string;
    getStatusIcon: (status: TaskStatus) => { icon: any; color: string };
    getPriorityInfo: (p: number) => { color: string; text: string };
}

// ── Accordion emoji row ───────────────────────────────────────────
function EmojiAccordionRow<T extends string>({
    label,
    options,
    selected,
    onSelect,
}: {
    label: string;
    options: { emoji: T; label: string; description: string }[];
    selected?: T | null;
    onSelect: (val: T | null) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const selectedOpt = options.find(o => o.emoji === selected);

    return (
        <div className="emoji-accordion-row">
            {/* Header — always visible */}
            <button
                className="emoji-accordion-header"
                onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
            >
                <span className="emoji-accordion-left">
                    <span className="emoji-accordion-icon">
                        {selected ?? '—'}
                    </span>
                    <span className="emoji-accordion-label">
                        {label}{selectedOpt ? `: ${selectedOpt.label}` : ''}
                    </span>
                </span>
                <span className={`emoji-accordion-chevron ${open ? 'open' : ''}`}>▾</span>
            </button>

            {/* Options — only shown when open */}
            {open && (
                <div className="emoji-accordion-options" onClick={e => e.stopPropagation()}>
                    {options.map(opt => (
                        <button
                            key={opt.emoji}
                            className={`dropdown-emoji-btn ${selected === opt.emoji ? 'active' : ''}`}
                            data-tip={opt.label}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(selected === opt.emoji ? null : opt.emoji as T);
                                setOpen(false);
                            }}
                        >
                            {opt.emoji}
                            <span className="emoji-accordion-opt-label">{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Inline emoji section inside dropdown ──────────────────────────
function EmojiDropdownSection({
    taskId,
    currentDifficulty,
    currentMood,
    updateTaskEmoji,
    closeDropdown,
}: {
    taskId: string;
    currentDifficulty?: DifficultyEmoji | null;
    currentMood?: CompletionMoodEmoji | null;
    updateTaskEmoji: Props['updateTaskEmoji'];
    closeDropdown: () => void;
}) {
    return (
        <>
            <div className="dropdown-divider" />
            <div className="dropdown-section-title">Rate This Task</div>

            <EmojiAccordionRow<DifficultyEmoji>
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                selected={currentDifficulty}
                onSelect={(val) => updateTaskEmoji(taskId, 'difficulty_emoji', val)}
            />
            <EmojiAccordionRow<CompletionMoodEmoji>
                label="Mood"
                options={MOOD_OPTIONS}
                selected={currentMood}
                onSelect={(val) => updateTaskEmoji(taskId, 'completion_mood', val)}
            />
        </>
    );
}

// ── Small emoji badge shown on the task card ──────────────────────
function EmojiBadges({ difficulty, mood }: { difficulty?: DifficultyEmoji | null; mood?: CompletionMoodEmoji | null }) {
    if (!difficulty && !mood) return null;
    const diffLabel = DIFFICULTY_OPTIONS.find(o => o.emoji === difficulty);
    const moodLabel = MOOD_OPTIONS.find(o => o.emoji === mood);

    return (
        <span className="task-emoji-badges">
            {difficulty && (
                <span
                    className="emoji-badge-chip"
                    title={diffLabel ? `Difficulty: ${diffLabel.label}` : 'Difficulty'}
                >
                    {difficulty}
                </span>
            )}
            {mood && (
                <span
                    className="emoji-badge-chip"
                    title={moodLabel ? `Mood: ${moodLabel.label}` : 'Mood'}
                >
                    {mood}
                </span>
            )}
        </span>
    );
}

export default function TaskList(props: Props) {
    const {
        filteredTasks,
        subtasks,
        loading,
        isMobileView,
        expandedTasks,
        openDropdownId,
        activeFilter,
        toggleTaskExpansion,
        toggleDropdown,
        closeDropdown,
        openModal,
        openEditModal,
        deleteTask,
        toggleTaskCompletion,
        updateTaskStatus,
        updateTaskEmoji,
        formatDueDate,
        getStatusIcon,
        getPriorityInfo
    } = props;

    return (
        <div className="task-list-container">
            {loading ? (
                <div className="loading-state">
                    <Clock className="animate-spin" size={24} />
                    <p>Loading tasks...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                    <Circle size={48} className="text-slate-300" />
                    <h3>No tasks found</h3>
                    <p>Get started by creating your first task!</p>
                    <button className="empty-state-button" onClick={() => openModal()}>
                        <Plus size={20} />
                        Create Task
                    </button>
                </div>
            ) : (
                <div className="tasks-list">
                    {filteredTasks.map(task => {
                        const taskSubtasks = task.id ? subtasks[task.id] || [] : [];
                        const displayedSubtasks = activeFilter === 'all'
                            ? taskSubtasks
                            : taskSubtasks.filter(s => s.status === activeFilter);
                        const subtaskDoneCount = taskSubtasks.filter(s => s.status === 'done').length;
                        const hasSubtasks = displayedSubtasks.length > 0;
                        const isExpanded = task.id ? expandedTasks.has(task.id) : false;
                        const statusInfo = getStatusIcon(task.status as TaskStatus);
                        const priorityInfo = getPriorityInfo(task.priority as number);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={task.id} className="task-row-container">
                                <div className="task-row">
                                    <button
                                        className="expand-button"
                                        onClick={() => task.id && hasSubtasks && toggleTaskExpansion(task.id)}
                                        disabled={!hasSubtasks}
                                    >
                                        {hasSubtasks ? (
                                            isExpanded ?
                                                <ChevronDown size={16} className="text-slate-500" /> :
                                                <ChevronRight size={16} className="text-slate-500" />
                                        ) : (
                                            <div className="w-4 h-4" />
                                        )}
                                    </button>

                                    <div className="task-content">
                                        <div className="task-title-row">
                                            <h3 className="task-title">
                                                {task.task_name}
                                                {task.id && (taskSubtasks.length > 0) && (
                                                    <span className="subtask-pill">
                                                        {subtaskDoneCount}/{taskSubtasks.length}
                                                    </span>
                                                )}
                                                {/* ✅ Emoji badges beside task name */}
                                                <EmojiBadges
                                                    difficulty={task.difficulty_emoji}
                                                    mood={task.completion_mood}
                                                />
                                            </h3>
                                        </div>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                    </div>

                                    <div className="status-badge">
                                        <StatusIcon size={16} className={statusInfo.color} />
                                        <span className="status-text">{task.status.replace('_', ' ')}</span>
                                    </div>

                                    <div className="priority-badge">
                                        <Flag size={16} className={priorityInfo.color} />
                                        <span className={`priority-text ${priorityInfo.color}`}>{priorityInfo.text}</span>
                                    </div>

                                    <div className="due-date">
                                        <Calendar size={16} className="text-slate-500" />
                                        <span className="due-date-text">{formatDueDate(task.due_date)}</span>
                                    </div>

                                    <div className="task-actions-dropdown">
                                        <div className="relative-position">
                                            <button
                                                className="more-actions-button"
                                                onClick={(e) => { e.stopPropagation(); task.id && toggleDropdown(task.id); }}
                                                aria-expanded={openDropdownId === task.id}
                                            >
                                                <MoreVertical size={16} className="text-slate-500" />
                                            </button>

                                            {openDropdownId === task.id && (
                                                isMobileView ? (
                                                    <div>
                                                        <div className="mobile-sheet-backdrop" onClick={closeDropdown} />
                                                        <div className="mobile-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                                                            <div className="mobile-sheet-header">
                                                                <button className="mobile-sheet-close" onClick={closeDropdown} aria-label="Close">×</button>
                                                            </div>
                                                            <div className="mobile-sheet-content">
                                                                <div className="dropdown-section-title">Change Status</div>
                                                                {task.status !== 'todo' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'todo'); }}>
                                                                        <Circle size={16} className="text-slate-400" /><span>Mark as To Do</span>
                                                                    </div>
                                                                )}
                                                                {task.status !== 'in_progress' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'in_progress'); }}>
                                                                        <Clock size={16} className="text-blue-500" /><span>Mark as In Progress</span>
                                                                    </div>
                                                                )}
                                                                {task.status !== 'done' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'done'); }}>
                                                                        <CheckCircle2 size={16} className="text-emerald-500" /><span>Mark as Done</span>
                                                                    </div>
                                                                )}

                                                                {/* ✅ Emoji section — mobile */}
                                                                {task.id && (
                                                                    <EmojiDropdownSection
                                                                        taskId={task.id}
                                                                        currentDifficulty={task.difficulty_emoji}
                                                                        currentMood={task.completion_mood}
                                                                        updateTaskEmoji={updateTaskEmoji}
                                                                        closeDropdown={closeDropdown}
                                                                    />
                                                                )}

                                                                <div className="dropdown-divider" />
                                                                {(task.parent_id === null || task.parent_id === undefined) && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && openModal(task.id); }}>
                                                                        <Plus size={16} /><span>Add Subtask</span>
                                                                    </div>
                                                                )}
                                                                <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(task); }}>
                                                                    <Pencil size={16} /><span>Edit Task</span>
                                                                </div>
                                                                <div className="dropdown-item delete" onClick={() => { closeDropdown(); task.id && deleteTask(task.id); }}>
                                                                    <Trash size={16} /><span>Delete Task</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                        <div className="dropdown-section-title">Change Status</div>
                                                        {task.status !== 'todo' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'todo'); }}>
                                                                <Circle size={14} className="text-slate-400" /><span>Mark as To Do</span>
                                                            </div>
                                                        )}
                                                        {task.status !== 'in_progress' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'in_progress'); }}>
                                                                <Clock size={14} className="text-blue-500" /><span>Mark as In Progress</span>
                                                            </div>
                                                        )}
                                                        {task.status !== 'done' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'done'); }}>
                                                                <CheckCircle2 size={14} className="text-emerald-500" /><span>Mark as Done</span>
                                                            </div>
                                                        )}

                                                        {/* ✅ Emoji section — desktop */}
                                                        {task.id && (
                                                            <EmojiDropdownSection
                                                                taskId={task.id}
                                                                currentDifficulty={task.difficulty_emoji}
                                                                currentMood={task.completion_mood}
                                                                updateTaskEmoji={updateTaskEmoji}
                                                                closeDropdown={closeDropdown}
                                                            />
                                                        )}

                                                        <div className="dropdown-divider" />
                                                        {(task.parent_id === null || task.parent_id === undefined) && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && openModal(task.id); }}>
                                                                <Plus size={14} /><span>Add Subtask</span>
                                                            </div>
                                                        )}
                                                        <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(task); }}>
                                                            <Pencil size={14} /><span>Edit Task</span>
                                                        </div>
                                                        <div className="dropdown-item delete" onClick={() => { closeDropdown(); task.id && deleteTask(task.id); }}>
                                                            <Trash size={14} /><span>Delete Task</span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {hasSubtasks && isExpanded && (
                                    <div className="subtasks-container">
                                        <div className="connector-line" />
                                        {displayedSubtasks.map((subtask) => {
                                            const subtaskStatusInfo = getStatusIcon(subtask.status as TaskStatus);
                                            const subtaskPriorityInfo = getPriorityInfo(subtask.priority as number);
                                            const SubtaskStatusIcon = subtaskStatusInfo.icon;

                                            return (
                                                <div key={subtask.id} className="subtask-row">
                                                    <div className="horizontal-connector" />
                                                    <div className="subtask-card">
                                                        <div className="expand-button-placeholder" />
                                                        <div className="task-content">
                                                            <div className="task-title-row">
                                                                <h4 className="subtask-title">
                                                                    {subtask.task_name}
                                                                    {/* ✅ Emoji badges for subtasks too */}
                                                                    <EmojiBadges
                                                                        difficulty={subtask.difficulty_emoji}
                                                                        mood={subtask.completion_mood}
                                                                    />
                                                                </h4>
                                                            </div>
                                                            {subtask.description && (
                                                                <p className="task-description">{subtask.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="status-badge">
                                                            <SubtaskStatusIcon size={16} className={subtaskStatusInfo.color} />
                                                            <span className="status-text">{subtask.status.replace('_', ' ')}</span>
                                                        </div>
                                                        <div className="priority-badge">
                                                            <Flag size={16} className={subtaskPriorityInfo.color} />
                                                            <span className={`priority-text ${subtaskPriorityInfo.color}`}>{subtaskPriorityInfo.text}</span>
                                                        </div>
                                                        <div className="due-date">
                                                            <Calendar size={16} className="text-slate-500" />
                                                            <span className="due-date-text">{formatDueDate(subtask.due_date)}</span>
                                                        </div>

                                                        <div className="task-actions-dropdown">
                                                            <div className="relative-position">
                                                                <button
                                                                    className="more-actions-button"
                                                                    onClick={(e) => { e.stopPropagation(); subtask.id && toggleDropdown(subtask.id); }}
                                                                    aria-expanded={openDropdownId === subtask.id}
                                                                >
                                                                    <MoreVertical size={16} className="text-slate-500" />
                                                                </button>

                                                                {openDropdownId === subtask.id && (
                                                                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                                        <div className="dropdown-section-title">Change Status</div>
                                                                        {subtask.status !== 'todo' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'todo'); }}>
                                                                                <Circle size={14} className="text-slate-400" /><span>Mark as To Do</span>
                                                                            </div>
                                                                        )}
                                                                        {subtask.status !== 'in_progress' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'in_progress'); }}>
                                                                                <Clock size={14} className="text-blue-500" /><span>Mark as In Progress</span>
                                                                            </div>
                                                                        )}
                                                                        {subtask.status !== 'done' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'done'); }}>
                                                                                <CheckCircle2 size={14} className="text-emerald-500" /><span>Mark as Done</span>
                                                                            </div>
                                                                        )}

                                                                        {/* ✅ Emoji section — subtask */}
                                                                        {subtask.id && (
                                                                            <EmojiDropdownSection
                                                                                taskId={subtask.id}
                                                                                currentDifficulty={subtask.difficulty_emoji}
                                                                                currentMood={subtask.completion_mood}
                                                                                updateTaskEmoji={updateTaskEmoji}
                                                                                closeDropdown={closeDropdown}
                                                                            />
                                                                        )}

                                                                        <div className="dropdown-divider" />
                                                                        <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(subtask); }}>
                                                                            <Pencil size={14} /><span>Edit Task</span>
                                                                        </div>
                                                                        <div className="dropdown-item delete" onClick={() => { closeDropdown(); subtask.id && deleteTask(subtask.id); }}>
                                                                            <Trash size={14} /><span>Delete Task</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}