import React, { useState, useEffect } from 'react';
import './task.css';
import './modal.css';
import '../../App.css';
import Section from '../../components/shared/section/section';
import { TaskRepository } from '../../../repository/TaskRepository';

const taskRepository = new TaskRepository();

function Task() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        task_name: '',
        description: '',
        priority: 1,
        status: 'todo',
        due_date: '',
    });
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        try {
            setLoading(true);
            const tasksFromDb = await taskRepository.getAllTasks();
            setTasks(tasksFromDb);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleTaskCompletion(id) {
        try {
            const task = tasks.find(t => t.id === id);
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            await taskRepository.updateStatus(id, newStatus);
            await loadTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    async function deleteTask(id) {
        try {
            await taskRepository.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    async function addTask() {
        try {
            const newTask = {
                task_name: 'New Task',
                description: 'Describe the task...',
                status: 'todo',
                priority: 3,
                due_date: new Date(),
            };
            await taskRepository.create(newTask);
            await loadTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    function openModal() {
        setForm({ task_name: '', description: '', priority: 3, due_date: '' });
        setShowValidationErrors(false);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setShowValidationErrors(false);
    }

    function handleFormChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function submitNewTask(e) {
        if (e && e.preventDefault) e.preventDefault();
        setShowValidationErrors(true);

        // Basic client-side validation: require a task name
        if (!form.task_name || form.task_name.trim() === '') {
            return;
        }

        try {
            const payload = {
                task_name: form.task_name || 'New Task',
                description: form.description || 'No description',
                status: form.status || 'todo',
                priority: Number(form.priority) || 1,
                due_date: form.due_date ? new Date(form.due_date) : new Date(),
            };
            await taskRepository.create(payload);
            await loadTasks();
            setShowValidationErrors(false);
            closeModal();
        } catch (error) {
            console.error('Error adding task from modal:', error);
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
                            const priorityLabels = ['', 'High', 'Medium', 'Low', 'Very Low'];
                            const dueDate = task.due_date ? new Date(task.due_date.seconds * 1000).toISOString().slice(0, 10) : 'No date';

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
                                                onChange={() => toggleTaskCompletion(task.id)}
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

                                    <footer className="task-actions">
                                        <button className="btn btn-edit" title="Edit">Edit</button>
                                        <button
                                            className="btn btn-delete"
                                            title="Delete"
                                            onClick={() => deleteTask(task.id)}
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

            {showModal && (
                <div className="task-modal-overlay" onClick={closeModal}>
                    <div className="task-modal" onClick={e => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <h2 className="task-modal-title">Add New Task</h2>
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
                                        Task Name<span className="task-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="task-input-field"
                                        name="task_name"
                                        id="taskName"
                                        placeholder="Enter task name"
                                        value={form.task_name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                    <div className="task-error-message" id="taskNameError" style={{ display: showValidationErrors && !form.task_name ? 'block' : 'none' }}>
                                        Task name is required
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
                                        <select className="task-input-field" id="taskStatus" name="status" value={form.status} onChange={handleFormChange}>
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
                                        <select className="task-input-field" id="taskPriority" name="priority" value={form.priority} onChange={handleFormChange}>
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
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button className="fab" aria-label="Add task" onClick={openModal}>
                +
            </button>
        </Section>
    );
}

export default Task;