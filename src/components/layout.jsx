import Sidebar from './shared/sidebar';
import './layout.css';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <>
            <Sidebar />
            <main className="content">
                <Outlet />
            </main>
        </>
    );
}