import { Link, useNavigate } from "react-router-dom";
import "./sidebar.css";
import { menuItems } from "../../../../services/MenuServices";
import { ReactNode } from "react";
import AuthService from "../../../../services/authService";

interface SidebarProps {
    children?: ReactNode;
}

export default function Sidebar({children}: SidebarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthService.signOutUser();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className="sidebar">
            
            <div className="sidebar-header">
               <h2>Tasky</h2>
            </div>
            
            <ul>
                {
                    menuItems.map((item) => (
                        <li key={item.link || item.action}>
                            {item.link ? (
                                <Link to={item.link}>
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
    );
}