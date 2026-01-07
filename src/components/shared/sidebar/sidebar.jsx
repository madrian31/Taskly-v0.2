import { Link } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar({children}) {
    return (
        <aside className="sidebar">
            <h2>Tasky</h2>
            <ul>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/tasks">Tasks</Link></li>
                <li><Link to="/calendar">Calendar</Link></li>
                <li><Link to="/settings">Settings</Link></li>
            </ul>
            {children}
        </aside>
    );
}