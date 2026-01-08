
import './layout.css';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="layout">
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}