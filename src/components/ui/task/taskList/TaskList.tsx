import React from 'react';
import { Task, Attachment } from '../../../../../model/Task';
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
    formatDueDate: (d?: Date) => string;
    getStatusIcon: (status: TaskStatus) => { icon: any; color: string };
    getPriorityInfo: (p: number) => { color: string; text: string };
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
                        
                        // Filter subtasks based on activeFilter
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
                                                    <span className="subtask-pill" aria-label={`${subtaskDoneCount} of ${taskSubtasks.length} subtasks completed`}>
                                                        {subtaskDoneCount}/{taskSubtasks.length}
                                                    </span>
                                                )}
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
                                                                {/* Quick Status Change - Only 3 statuses */}
                                                                <div className="dropdown-section-title">Change Status</div>
                                                                
                                                                {task.status !== 'todo' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'todo'); }}>
                                                                        <Circle size={16} className="text-slate-400" />
                                                                        <span>Mark as To Do</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {task.status !== 'in_progress' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'in_progress'); }}>
                                                                        <Clock size={16} className="text-blue-500" />
                                                                        <span>Mark as In Progress</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {task.status !== 'done' && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'done'); }}>
                                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                                        <span>Mark as Done</span>
                                                                    </div>
                                                                )}

                                                                <div className="dropdown-divider"></div>

                                                                {(task.parent_id === null || task.parent_id === undefined) && (
                                                                    <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && openModal(task.id); }}>
                                                                        <Plus size={16} />
                                                                        <span>Add Subtask</span>
                                                                    </div>
                                                                )}

                                                                <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(task); }}>
                                                                    <Pencil size={16} />
                                                                    <span>Edit Task</span>
                                                                </div>

                                                                <div className="dropdown-item delete" onClick={() => { closeDropdown(); task.id && deleteTask(task.id); }}>
                                                                    <Trash size={16} />
                                                                    <span>Delete Task</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                        {/* Quick Status Change - Only 3 statuses */}
                                                        <div className="dropdown-section-title">Change Status</div>
                                                        
                                                        {task.status !== 'todo' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'todo'); }}>
                                                                <Circle size={14} className="text-slate-400" />
                                                                <span>Mark as To Do</span>
                                                            </div>
                                                        )}
                                                        
                                                        {task.status !== 'in_progress' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'in_progress'); }}>
                                                                <Clock size={14} className="text-blue-500" />
                                                                <span>Mark as In Progress</span>
                                                            </div>
                                                        )}
                                                        
                                                        {task.status !== 'done' && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && updateTaskStatus(task.id, 'done'); }}>
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                                <span>Mark as Done</span>
                                                            </div>
                                                        )}

                                                        <div className="dropdown-divider"></div>

                                                        {(task.parent_id === null || task.parent_id === undefined) && (
                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); task.id && openModal(task.id); }}>
                                                                <Plus size={14} />
                                                                <span>Add Subtask</span>
                                                            </div>
                                                        )}

                                                        <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(task); }}>
                                                            <Pencil size={14} />
                                                            <span>Edit Task</span>
                                                        </div>

                                                        <div className="dropdown-item delete" onClick={() => { closeDropdown(); task.id && deleteTask(task.id); }}>
                                                            <Trash size={14} />
                                                            <span>Delete Task</span>
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
                                                                <h4 className="subtask-title">{subtask.task_name}</h4>
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
                                                                        {/* Quick Status Change for Subtasks - Only 3 statuses */}
                                                                        <div className="dropdown-section-title">Change Status</div>
                                                                        
                                                                        {subtask.status !== 'todo' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'todo'); }}>
                                                                                <Circle size={14} className="text-slate-400" />
                                                                                <span>Mark as To Do</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {subtask.status !== 'in_progress' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'in_progress'); }}>
                                                                                <Clock size={14} className="text-blue-500" />
                                                                                <span>Mark as In Progress</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {subtask.status !== 'done' && (
                                                                            <div className="dropdown-item" onClick={() => { closeDropdown(); subtask.id && updateTaskStatus(subtask.id, 'done'); }}>
                                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                                                <span>Mark as Done</span>
                                                                            </div>
                                                                        )}

                                                                        <div className="dropdown-divider"></div>

                                                                        <div className="dropdown-item" onClick={() => { closeDropdown(); openEditModal(subtask); }}>
                                                                            <Pencil size={14} />
                                                                            <span>Edit Task</span>
                                                                        </div>

                                                                        <div className="dropdown-item delete" onClick={() => { closeDropdown(); subtask.id && deleteTask(subtask.id); }}>
                                                                            <Trash size={14} />
                                                                            <span>Delete Task</span>
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