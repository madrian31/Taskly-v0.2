import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./sidebar.css";
import { getMenuForRole } from "../../../../services/MenuServices";
import { ReactNode } from "react";
import AuthService from "../../../../services/authService";
import { getAvatarUrl } from "../../../services/avatar";
import UsersRepository from "../../../../repository/UsersRepository";

interface SidebarProps {
    children?: ReactNode;
}

export default function Sidebar({children}: SidebarProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>('user');

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
            if (user) {
                setUserName(user.displayName || user.email || 'User');
                setUserEmail(user.email || '');
                
                // Fetch user document from Firestore to get saved photoURL
                try {
                    const userDoc = await UsersRepository.getById(user.uid);
                    console.log('Sidebar auth user:', user)
                    console.log('Sidebar providerData:', user.providerData)
                    console.log('Sidebar userDoc from Firestore:', userDoc)

                        if (userDoc && userDoc.photoURL) {
                            setUserPhoto(userDoc.photoURL);
                        } else {
                        // Fallback to auth photoURL or providerData
                        const providerPhoto = user.providerData && user.providerData.length > 0
                            ? (user.providerData[0] as any).photoURL
                            : undefined;
                        setUserPhoto(user.photoURL ?? providerPhoto ?? null);
                    }
                        // set role from user document (defaults to 'user' in model)
                        if (userDoc && userDoc.role) {
                            setUserRole(userDoc.role);
                        } else {
                            setUserRole('user');
                        }
                } catch (error) {
                    console.error('Failed to fetch user document:', error);
                    // Fallback to auth photoURL
                    const providerPhoto = user.providerData && user.providerData.length > 0
                        ? (user.providerData[0] as any).photoURL
                        : undefined;
                    setUserPhoto(user.photoURL ?? providerPhoto ?? null);
                }
            } else {
                setUserName(null);
                setUserEmail(null);
                setUserPhoto(null);
                setUserRole('user');
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
                        getMenuForRole(userRole).map((item) => (
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