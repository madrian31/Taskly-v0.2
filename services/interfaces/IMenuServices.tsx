export interface MenuItem {
    sortOrder: number;
    name: string;
    icon: string;
    link?: string;
    action?: 'logout';
}