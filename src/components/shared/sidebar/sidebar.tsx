import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./sidebar.css";
import { menuItems } from "../../../../services/MenuServices";
import { ReactNode } from "react";
import AuthService from "../../../../services/authService";

interface SidebarProps {
    children?: ReactNode;
}

export default function Sidebar({children}: SidebarProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await AuthService.signOutUser();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Menu Button */}
            <button
                className={`hamburger-btn ${isOpen ? 'hamburger-open' : ''}`}
                onClick={toggleSidebar}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <i className="bi bi-list"></i>
            </button>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                
                <div className="sidebar-header">

                 <h2>Tasky</h2>

                <div className="user-profile">
                    <div className="user-avatar">
                        <img id="userPhoto" src="https://ui-avatars.com/api/?name=User&background=3498db&color=fff" alt="Profile" />
                    </div>
                    <div className="user-info">
                        <h4 id="userName">Loading...</h4>
                        <p id="userEmail">Please wait...</p>
                    </div>
                    </div>

                </div>
                
                <ul>
                    {
                        menuItems.map((item) => (
                            <li key={item.link || item.action}>
                                {item.link ? (
                                    <Link to={item.link} onClick={closeSidebar}>
                                        {item.icon && <span className="material-icons">{item.icon}</span>}
                                        {item.name}
                                    </Link>
                                ) : item.action === 'logout' ? (
                                    <button 
                                        onClick={handleLogout}
                                        className="logout-btn"
                                    >
                                        {item.icon && <span className="material-icons">{item.icon}</span>}
                                        {item.name}
                                    </button>
                                ) : null}
                            </li>
                        ))
                    }
                </ul>
                {children}
            </aside>
        </>
    );
}