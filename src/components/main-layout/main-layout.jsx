// components/main-layout/main-layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/sidebar/sidebar';
import './main-layout.css';

function MainLayout () {
  return (
    <div className="main-layout-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;