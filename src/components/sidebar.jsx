import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
        <h2>Sidebar</h2>
        <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
        </ul>
    </div>
        )
    }
export default Sidebar;