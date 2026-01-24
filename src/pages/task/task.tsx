import React, { useState, useEffect } from 'react';
import './task.css';
import './modal.css';
import '../../App.css';
import Section from '../../components/shared/section/section';
import { TaskRepository } from '../../../repository/TaskRepository';
import { TaskService } from '../../../services/TaskService';
import { Task } from '../../../model/Task';
import { TaskStatus } from '../../../model/Task';
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
    Search, 
    Filter,
    Pencil,
    Trash,
    X
} from 'lucide-react';

// Using native date input instead of react-datepicker for native OS picker

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

function TaskComponent() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subtasks, setSubtasks] = useState<{ [key: string]: Task[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [isSubtaskMode, setIsSubtaskMode] = useState<boolean>(false);
    const [parentTaskId, setParentTaskId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [form, setForm] = useState({
        task_name: '',
        description: '',
        priority: 3,
        status: 'todo' as TaskStatus,
        due_date: '' as string,
    });
    const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        try {
            setLoading(true);
            console.log('Loading tasks from Firestore...');
            const mainTasks = await taskRepository.getMainTasks();
            console.log('Main tasks loaded:', mainTasks);
            setTasks(mainTasks);

            // Load subtasks for each main task
            const subtasksMap: { [key: string]: Task[] } = {};
            for (const task of mainTasks) {
                if (task.id) {
                    const subs = await taskRepository.getSubTasks(task.id);
                    subtasksMap[task.id] = subs;
                }
            }
            setSubtasks(subtasksMap);
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Error loading tasks: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function toggleTaskCompletion(id: string, isSubtask: boolean = false) {
        try {
            const task = isSubtask 
                ? Object.values(subtasks).flat().find(t => t.id === id)
                : tasks.find(t => t.id === id);
            
            if (!task) return;
            
            const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
            
            if (newStatus === 'done') {
                await taskService.completeTask(id);
            } else {
                await taskRepository.updateStatus(id, newStatus);
            }
            
            await loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error updating task: ' + (error as Error).message);
        }
    }

    async function deleteTask(id: string) {
        try {
            await taskService.deleteTask(id);
            await loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task: ' + (error as Error).message);
        }
    }

    function openModal(parentId?: string) {
        setForm({ 
            task_name: '', 
            description: '', 
            priority: 3, 
            status: 'todo',
            due_date: '' 
        });
        setShowValidationErrors(false);
        setEditingTaskId(null);
        
        if (parentId) {
            setIsSubtaskMode(true);
            setParentTaskId(parentId);
        } else {
            setIsSubtaskMode(false);
            setParentTaskId(null);
        }
        
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setShowValidationErrors(false);
        setIsSubtaskMode(false);
        setParentTaskId(null);
        setEditingTaskId(null);
    }

    function openEditModal(task: Task) {
        setForm({
            task_name: task.task_name || '',
            description: task.description || '',
            priority: task.priority || 2,
            status: task.status || 'todo',
                due_date: task.due_date
                    ? ((task.due_date as any).seconds
                        ? new Date((task.due_date as any).seconds * 1000).toISOString().slice(0,10)
                        : new Date(task.due_date as Date).toISOString().slice(0,10))
                    : ''
        });
        setEditingTaskId(task.id || null);
        // If the task has a parent_id it is a subtask — reflect that in the modal
        setIsSubtaskMode(task.parent_id !== null && task.parent_id !== undefined);
        setParentTaskId(task.parent_id ?? null);
        setShowModal(true);
    }

    function closeSuccessModal() {
        setShowSuccessModal(false);
    }

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // using native input, no DatePicker handler needed

    // Toggle expanded state for tasks with subtasks
    function toggleTaskExpansion(taskId: string) {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }

    // Dropdown handling
    function toggleDropdown(taskId: string) {
        setOpenDropdownId(prev => (prev === taskId ? null : taskId));
    }

    function closeDropdown() {
        setOpenDropdownId(null);
    }

    useEffect(() => {
        function onDocClick() {
            closeDropdown();
        }

        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    // Filter tasks based on active filter and search query
    function getFilteredTasks() {
        let filtered = tasks;

        // Apply status filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(task => {
                switch (activeFilter) {
                    case 'todo': return task.status === 'todo';
                    case 'in_progress': return task.status === 'in_progress';
                    case 'done': return task.status === 'done';
                    default: return true;
                }
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task => 
                task.task_name.toLowerCase().includes(query) || 
                (task.description && task.description.toLowerCase().includes(query))
            );
        }

        return filtered;
    }

    // Get status icon and color
    function getStatusIcon(status: TaskStatus) {
        switch (status) {
            case 'todo': return { icon: Circle, color: 'text-slate-400' };
            case 'in_progress': return { icon: Clock, color: 'text-blue-500' };
            case 'done': return { icon: CheckCircle2, color: 'text-emerald-500' };
            default: return { icon: AlertCircle, color: 'text-red-500' };
        }
    }

    // Get priority color and text
    function getPriorityInfo(priority: number) {
        switch (priority) {
            case 1: return { color: 'text-slate-400', text: 'P4' };
            case 2: return { color: 'text-blue-500', text: 'P3' };
            case 3: return { color: 'text-orange-500', text: 'P2' };
            case 4: return { color: 'text-red-500', text: 'P1' };
            default: return { color: 'text-slate-400', text: 'P4' };
        }
    }

    // Format due date
    function formatDueDate(dueDate: Date | undefined) {
        if (!dueDate) return 'No date';
        
        const date = dueDate as any;
        const actualDate = date.seconds 
            ? new Date(date.seconds * 1000) 
            : new Date(dueDate);
        
        return actualDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    async function submitNewTask(e?: React.FormEvent) {
        if (e && e.preventDefault) e.preventDefault();
        setShowValidationErrors(true);

        if (!form.task_name || form.task_name.trim() === '') {
            return;
        }

        try {
            const payload: Task = {
                task_name: form.task_name.trim(),
                description: form.description.trim() || undefined,
                status: form.status,
                priority: Number(form.priority) as 1 | 2 | 3 | 4,
                due_date: form.due_date ? new Date(form.due_date) : undefined,
                parent_id: isSubtaskMode && parentTaskId ? parentTaskId : undefined,
            };
            
            console.log('Submitting task:', payload);

            if (editingTaskId) {
                // Edit existing task
                await taskRepository.updateTask(editingTaskId, payload);
                console.log('Task updated successfully!');
            } else {
                await taskRepository.createTask(payload);
                console.log('Task created successfully!');
            }

            await loadTasks();
            console.log('Tasks reloaded');

            setShowValidationErrors(false);
            closeModal();
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error('Error adding task from modal:', error);
            alert('Failed to add task: ' + (error as Error).message + '\n\nCheck console for details.');
        }
    }

    return (
        <Section id="task">
            {/* Professional Header Section */}
            <div className="task-header-section">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="header-title">Tasks</h1>
                        <p className="header-subtitle">Manage your tasks effectively with Taskly</p>
                    </div>
                    <div className="header-right">
                        <div className="search-container">
                            <Search className="search-icon" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="filter-button">
                            <Filter size={20} />
                        </button>
                        <button className="new-task-button" onClick={() => openModal()}>
                            <Plus size={20} />
                            New Task
                        </button>
                    </div>
                </div>
                
                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {[
                        { key: 'all', label: 'All Tasks' },
                        { key: 'todo', label: 'To Do' },
                        { key: 'in_progress', label: 'In Progress' },
                        { key: 'done', label: 'Done' }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter.key)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            <div className="task-list-container">
                {loading ? (
                    <div className="loading-state">
                        <Clock className="animate-spin" size={24} />
                        <p>Loading tasks...</p>
                    </div>
                ) : getFilteredTasks().length === 0 ? (
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
                        {getFilteredTasks().map(task => {
                            const taskSubtasks = task.id ? subtasks[task.id] || [] : [];
                            const hasSubtasks = taskSubtasks.length > 0;
                            const isExpanded = task.id ? expandedTasks.has(task.id) : false;
                            const statusInfo = getStatusIcon(task.status);
                            const priorityInfo = getPriorityInfo(task.priority);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={task.id} className="task-row-container">
                                    {/* Main Task Row */}
                                    <div className="task-row">
                                        {/* Expand/Collapse Button */}
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
                                                <div className="w-4 h-4" /> /* Placeholder for alignment */
                                            )}
                                        </button>

                                        {/* Task Content */}
                                        <div className="task-content">
                                            <div className="task-title-row">
                                                <h3 className="task-title">{task.task_name}</h3>
                                            </div>
                                            {task.description && (
                                                <p className="task-description">{task.description}</p>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="status-badge">
                                            <StatusIcon size={16} className={statusInfo.color} />
                                            <span className="status-text">{task.status.replace('_', ' ')}</span>
                                        </div>

                                        {/* Priority Flag */}
                                        <div className="priority-badge">
                                            <Flag size={16} className={priorityInfo.color} />
                                            <span className={`priority-text ${priorityInfo.color}`}>{priorityInfo.text}</span>
                                        </div>

                                        {/* Due Date */}
                                        <div className="due-date">
                                            <Calendar size={16} className="text-slate-500" />
                                            <span className="due-date-text">{formatDueDate(task.due_date)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="task-actions-dropdown">
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    className="more-actions-button"
                                                    onClick={(e) => { e.stopPropagation(); task.id && toggleDropdown(task.id); }}
                                                    aria-expanded={openDropdownId === task.id}
                                                >
                                                    <MoreVertical size={16} className="text-slate-500" />
                                                </button>

                                                {openDropdownId === task.id && (
                                                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                        {/* Add Subtask - only for main tasks */}
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
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtasks */}
                                    {hasSubtasks && isExpanded && (
                                        <div className="subtasks-container">
                                            {/* Vertical connector line */}
                                            <div className="connector-line" />
                                            
                                            {taskSubtasks.map((subtask, index) => {
                                                const subtaskStatusInfo = getStatusIcon(subtask.status);
                                                const subtaskPriorityInfo = getPriorityInfo(subtask.priority);
                                                const SubtaskStatusIcon = subtaskStatusInfo.icon;

                                                return (
                                                    <div key={subtask.id} className="subtask-row">
                                                        {/* Horizontal connector */}
                                                        <div className="horizontal-connector" />
                                                        
                                                        {/* Subtask Card */}
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
                                                                <div style={{ position: 'relative' }}>
                                                                    <button
                                                                        className="more-actions-button"
                                                                        onClick={(e) => { e.stopPropagation(); subtask.id && toggleDropdown(subtask.id); }}
                                                                        aria-expanded={openDropdownId === subtask.id}
                                                                    >
                                                                        <MoreVertical size={16} className="text-slate-500" />
                                                                    </button>

                                                                    {openDropdownId === subtask.id && (
                                                                        <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
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

            {/* Add Task/Subtask Modal */}
            {showModal && (
                <div className="task-modal-overlay" onClick={closeModal}>
                    <div className="task-modal" onClick={e => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <h2 className="task-modal-title">
                                    {editingTaskId ? (isSubtaskMode ? 'Edit Subtask' : 'Edit Task') : (isSubtaskMode ? 'Add New Subtask' : 'Add New Task')}
                                </h2>
                            <button
                                className="task-modal-close-btn"
                                type="button"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="task-modal-body">
                            <form id="taskForm" onSubmit={submitNewTask}>
                                <div className="task-form-group">
                                    <label className="task-form-label">
                                        {isSubtaskMode ? 'Subtask Name' : 'Task Name'}
                                        <span style={{color: '#dc2626'}}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="task-input-field"
                                        name="task_name"
                                        id="taskName"
                                        placeholder={isSubtaskMode ? "Enter subtask name" : "Enter task name"}
                                        value={form.task_name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                    <div 
                                        className="task-error-message" 
                                        id="taskNameError" 
                                        style={{ display: showValidationErrors && !form.task_name ? 'block' : 'none' }}
                                    >
                                        {isSubtaskMode ? 'Subtask name is required' : 'Task name is required'}
                                    </div>
                                </div>

                                <div className="task-form-group">
                                    <label className="task-form-label">Description</label>
                                    <textarea
                                        className="task-input-field"
                                        id="taskDescription"
                                        name="description"
                                        placeholder="Add a description (optional)"
                                        value={form.description}
                                        onChange={handleFormChange}
                                    ></textarea>
                                </div>

                                <div className="task-form-row">
                                    <div className="task-form-group">
                                        <label className="task-form-label">Status</label>
                                        <select 
                                            className="task-input-field" 
                                            id="taskStatus" 
                                            name="status" 
                                            value={form.status} 
                                            onChange={handleFormChange}
                                        >
                                            <option value="todo">Todo</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>

                                    <div className="task-form-group">
                                        <label className="task-form-label task-priority-label-header">
                                            Priority
                                            <span className="task-info-icon">i</span>
                                        </label>
                                        <select 
                                            className="task-input-field" 
                                            id="taskPriority" 
                                            name="priority" 
                                            value={form.priority} 
                                            onChange={handleFormChange}
                                        >
                                            <option value={1}>Low</option>
                                            <option value={2}>Medium</option>
                                            <option value={3}>High</option>
                                            <option value={4}>Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="task-form-group">
                                    <label className="task-form-label">Due Date</label>
                                    <input
                                        type="date"
                                        className="task-input-field"
                                        id="taskDueDate"
                                        name="due_date"
                                        value={form.due_date}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="task-modal-footer">
                            <button type="button" className="task-btn task-btn-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                            <button type="button" className="task-btn task-btn-primary" onClick={submitNewTask}>
                                {editingTaskId ? (isSubtaskMode ? 'Save Subtask' : 'Save Task') : (isSubtaskMode ? 'Add Subtask' : 'Add Task')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="task-modal-overlay" onClick={closeSuccessModal}>
                    <div 
                        className="task-modal" 
                        onClick={e => e.stopPropagation()}
                        style={{maxWidth: '400px', textAlign: 'center'}}
                    >
                        <div className="task-modal-header" style={{borderBottom: 'none', justifyContent: 'flex-end', padding: '12px 16px'}}>
                            <button
                                className="task-modal-close-btn"
                                type="button"
                                onClick={closeSuccessModal}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="task-modal-body" style={{padding: '20px 32px 32px'}}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid #7c3aed'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>

                            <h2 style={{
                                fontSize: '1.5rem',
                                color: '#0f172a',
                                marginBottom: '12px',
                                fontWeight: '600'
                            }}>
                                Awesome!
                            </h2>
                            
                            <p style={{
                                color: '#64748b',
                                fontSize: '0.95rem',
                                marginBottom: '28px'
                            }}>
                                {isSubtaskMode ? 'Subtask' : 'Task'} successfully added to your list
                            </p>

                            <button 
                                type="button" 
                                className="task-btn task-btn-primary"
                                onClick={closeSuccessModal}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem'
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Section>
    );
}

export default TaskComponent;