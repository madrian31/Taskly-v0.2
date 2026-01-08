import {MenuItem} from './interfaces/IMenuServices';

const menuItems: MenuItem[] = [
    {
        sortOrder: 1,
        name: 'Home',
        icon: 'home',
        link: '/'
    },
    {
        sortOrder: 2,
        name: 'Tasks',
        icon: 'check_circle',
        link: '/'
    },
    {
        sortOrder: 3,
        name:'Calendar',
        icon: 'calendar_today',
        link: '/calendar'
    },
    {
        sortOrder: 4,
        name: 'Settings',
        icon: 'settings',
        link: '/settings'   
    }
]