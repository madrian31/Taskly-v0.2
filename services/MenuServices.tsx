import {MenuItem} from './interfaces/IMenuServices';

export const menuItems: MenuItem[] = [
    {
        sortOrder: 1,
        name: 'Dashboard',
        icon: '',
        link: '/dashboard'
    },
    {
        sortOrder: 8,
        name: 'Tasks',
        icon: '',
        link: '/task'
    },
    {
        sortOrder: 16,
        name:'Calendar',
        icon: '',
        link: '/calendar'
    },
    {
        sortOrder: 24,
        name: 'Users',
        icon: '',
        link: '/users'
    },
    {
        sortOrder: 32,
        name: 'Settings',
        icon: '',
        link: '/settings'   
    },
    {
        sortOrder: 99,
        name: 'Logout',
        icon: '',
        action: 'logout'
    }
]