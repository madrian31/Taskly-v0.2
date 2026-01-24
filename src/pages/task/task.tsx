import React, { useState, useEffect } from 'react';
import './task.css';
import './modal.css';
import '../../App.css';
import Section from '../../components/shared/section/section';
import { TaskRepository } from '../../../repository/TaskRepository';
import { TaskService } from '../../../services/TaskService';
import { Task } from '../../../model/Task';
import { TaskStatus } from '../../../model/Task';

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
    const [form, setForm] = useState({
        task_name: '',
        description: '',
        priority: 3,
        status: 'todo' as TaskStatus,
        due_date: '',
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
    }

    function closeSuccessModal() {
        setShowSuccessModal(false);
    }

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            
            await taskRepository.createTask(payload);
            console.log('Task created successfully!');
            
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
            <div className="task-header">
                <div>
                    <h2>Your Tasks</h2>
                    <p>Manage your tasks effectively with Taskly.</p>
                </div>
            </div>

            <div className='task-container'>
                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks yet. Click + to add your first task!</p>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map(task => {
                            const completed = task.status === 'done';
                            const priorityLabels = ['', 'Low', 'Medium', 'High', 'Urgent'];
                            const dueDate = task.due_date 
                                ? (task.due_date as any).seconds 
                                    ? new Date((task.due_date as any).seconds * 1000).toISOString().slice(0, 10)
                                    : new Date(task.due_date).toISOString().slice(0, 10)
                                : 'No date';

                            const taskSubtasks = task.id ? subtasks[task.id] || [] : [];

                            return (
                                <article
                                    className={`task-card ${completed ? 'completed' : ''}`}
                                    key={task.id}
                                >
                                    <header className="task-top">
                                        <label className="check">
                                            <input
                                                type="checkbox"
                                                checked={completed}
                                                onChange={() => task.id && toggleTaskCompletion(task.id)}
                                            />
                                            <span className="checkmark" />
                                        </label>
                                        <div className="task-main">
                                            <h3 className="task-title">{task.task_name}</h3>
                                            <p className="task-desc">{task.description || 'No description'}</p>
                                        </div>
                                    </header>

                                    <div className="badges">
                                        <span className="badge badge-assignee">{task.status}</span>
                                        <span className="badge badge-date">{dueDate}</span>
                                        <span className="badge badge-frequency">{priorityLabels[task.priority]}</span>
                                    </div>

                                    {/* Subtasks Section */}
                                    {taskSubtasks.length > 0 && (
                                        <div className="subtasks">
                                            <div className="subtasks-header">Subtasks ({taskSubtasks.length})</div>
                                            <ul>
                                                {taskSubtasks.map(subtask => (
                                                    <li 
                                                        key={subtask.id} 
                                                        className={`subtask ${subtask.status === 'done' ? 'done' : ''}`}
                                                    >
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={subtask.status === 'done'}
                                                                onChange={() => subtask.id && toggleTaskCompletion(subtask.id, true)}
                                                            />
                                                            <span className="sub-label">{subtask.task_name}</span>
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <footer className="task-actions">
                                        <button 
                                            className="btn btn-edit" 
                                            title="Add Subtask"
                                            onClick={() => task.id && openModal(task.id)}
                                        >
                                            + Subtask
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            title="Delete"
                                            onClick={() => task.id && deleteTask(task.id)}
                                        >
                                            Delete
                                        </button>
                                    </footer>
                                </article>
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
                                {isSubtaskMode ? 'Add New Subtask' : 'Add New Task'}
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
                                {isSubtaskMode ? 'Add Subtask' : 'Add Task'}
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

            <button className="fab" aria-label="Add task" onClick={() => openModal()}>
                +
            </button>
        </Section>
    );
}

export default TaskComponent;