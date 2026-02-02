import {MenuItem} from './interfaces/IMenuServices';

export const menuItems: MenuItem[] = [
    {
        sortOrder: 1,
        name: 'Dashboard',
        icon: '',
        link: '/dashboard',
        role: 'everyone'
    },
    {
        sortOrder: 8,
        name: 'Tasks',
        icon: '',
        link: '/task',
        role: 'everyone'
    },
    {
        sortOrder: 16,
        name:'Calendar',
        icon: '',
        link: '/calendar',
        role: 'everyone'
    },
    {
        sortOrder: 24,
        name: 'Users',
        icon: '',
        link: '/users',
        role: 'admin'
    },
    {
        sortOrder: 32,
        name: 'Settings',
        icon: '',
        link: '/settings',   
        role: 'admin'
    },
    {
        sortOrder: 99,
        name: 'Logout',
        icon: '',
        action: 'logout',
        role: 'everyone'
    }
]

export function getMenuForRole(role: string): MenuItem[] {
    return menuItems.filter(item => item.role === 'everyone' || item.role === role);
}