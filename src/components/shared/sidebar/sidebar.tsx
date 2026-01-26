import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./sidebar.css";
import { menuItems } from "../../../../services/MenuServices";
import { ReactNode } from "react";
import AuthService from "../../../../services/authService";
import { getAvatarUrl } from "../../../services/avatar";

interface SidebarProps {
    children?: ReactNode;
}

export default function Sidebar({children}: SidebarProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
            if (user) {
                setUserName(user.displayName || user.email || 'User');
                setUserEmail(user.email || '');
                setUserPhoto(user.photoURL || null);
            } else {
                setUserName(null);
                setUserEmail(null);
                setUserPhoto(null);
            }
        });

        return () => unsubscribe();
    }, []);

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
                        <img
                            id="userPhoto"
                            src={getAvatarUrl({ photoURL: userPhoto, name: userName || 'User', size: 80, bgColor: '#3498db' })}
                            alt="Profile"
                        />
                    </div>
                    <div className="user-info">
                        <h5 id="userName">{userName ?? 'Loading...'}</h5>
                        {/* <p id="userEmail">{userEmail ?? 'Please wait...'}</p> */}
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