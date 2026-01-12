import React, { useState } from 'react';
import './task.css';
import '../../App.css';
import Section from '../../components/shared/section/section';

const sampleTasks = [
    {
        id: 1,
        title: 'Design landing page',
        description: 'Create hero, features and CTA sections',
        assignee: 'Ava',
        dueDate: '2026-01-20',
        frequency: 'Weekly',
        completed: false,
        subtasks: [
            { id: 11, title: 'Wireframe', completed: true },
            { id: 12, title: 'High-fidelity mock', completed: false },
        ],
    },
    {
        id: 2,
        title: 'Write docs',
        description: 'Update README and usage examples',
        assignee: 'Liam',
        dueDate: '2026-01-25',
        frequency: 'Monthly',
        completed: false,
        subtasks: [
            { id: 21, title: 'API section', completed: false },
            { id: 22, title: 'Examples', completed: false },
        ],
    },
];

function Task() {
    const [tasks, setTasks] = useState(sampleTasks);

    function toggleTaskCompletion(id) {
        setTasks(prev =>
            prev.map(t => {
                if (t.id !== id) return t;
                // toggle; if marking complete mark all subtasks complete as well
                const completed = !t.completed;
                return {
                    ...t,
                    completed,
                    subtasks: t.subtasks.map(s => ({ ...s, completed: completed ? true : s.completed })),
                };
            })
        );
    }

    function toggleSubtask(taskId, subId) {
        setTasks(prev =>
            prev.map(t => {
                if (t.id !== taskId) return t;
                const subtasks = t.subtasks.map(s => (s.id === subId ? { ...s, completed: !s.completed } : s));
                const allDone = subtasks.every(s => s.completed);
                return { ...t, subtasks, completed: allDone };
            })
        );
    }

    function deleteTask(id) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }

    function addTask() {
        const id = Date.now();
        const newTask = {
            id,
            title: 'New Task',
            description: 'Describe the task...',
            assignee: 'You',
            dueDate: new Date().toISOString().slice(0, 10),
            frequency: 'Once',
            completed: false,
            subtasks: [],
        };
        setTasks(prev => [newTask, ...prev]);
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
                <div className="tasks-grid">
                    {tasks.map(task => {
                        const completedCount = task.subtasks.filter(s => s.completed).length;
                        const total = task.subtasks.length;

                        return (
                            <article
                                className={`task-card ${task.completed ? 'completed' : ''}`}
                                key={task.id}
                            >
                                <header className="task-top">
                                    <label className="check">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleTaskCompletion(task.id)}
                                        />
                                        <span className="checkmark" />
                                    </label>
                                    <div className="task-main">
                                        <h3 className="task-title">{task.title}</h3>
                                        <p className="task-desc">{task.description}</p>
                                    </div>
                                </header>

                                <div className="badges">
                                    <span className="badge badge-assignee">{task.assignee}</span>
                                    <span className="badge badge-date">{task.dueDate}</span>
                                    <span className="badge badge-frequency">{task.frequency}</span>
                                </div>

                                <section className="subtasks">
                                    <div className="subtasks-header">
                                        <small>
                                            {total > 0 ? `${completedCount}/${total} completed` : 'No subtasks'}
                                        </small>
                                    </div>
                                    <ul>
                                        {task.subtasks.map(sub => (
                                            <li key={sub.id} className={`subtask ${sub.completed ? 'done' : ''}`}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={sub.completed}
                                                        onChange={() => toggleSubtask(task.id, sub.id)}
                                                    />
                                                    <span className="sub-label">{sub.title}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <footer className="task-actions">
                                    <button className="btn btn-edit" title="Edit">Edit</button>
                                    <button className="btn btn-share" title="Share">Share</button>
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
            </div>

            <button className="fab" aria-label="Add task" onClick={addTask}>
                +
            </button>
        </Section>
    );
}

export default Task;