import React, { useState, useEffect } from 'react';
import './task.css';
import '../../App.css';
import Section from '../../components/shared/section/section';
import { TaskRepository } from '../../../repository/TaskRepository';

const taskRepository = new TaskRepository();

function Task() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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

            <button className="fab" aria-label="Add task" onClick={addTask}>
                +
            </button>
        </Section>
    );
}

export default Task;