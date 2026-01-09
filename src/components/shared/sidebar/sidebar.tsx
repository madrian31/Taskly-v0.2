import { Link } from "react-router-dom";
import "./sidebar.css";
import { menuItems } from "../../../../services/MenuServices";
import { ReactNode } from "react";

interface SidebarProps {
    children?: ReactNode;
}

export default function Sidebar({children}: SidebarProps) {
    return (
        <aside className="sidebar">
            <h2>Tasky</h2>
            <ul>
                {
                    menuItems.map((item) => (
                        <li key={item.Link}>
                            <Link to={item.link}>
                                {item.icon && <span className="material-icons">{item.icon}</span>}
                                {item.name}
                            </Link>
                        </li>
                    ))
                }
            </ul>
            {children}
        </aside>
    );
}