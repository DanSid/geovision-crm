import * as Icons from 'tabler-icons-react';

export const NavMenu = [
    {
        group: '',
        contents: [
            {
                name: 'Dashboard',
                icon: <Icons.Template />,
                path: '/dashboard',
            },
        ]
    },
    {
        group: 'CRM',
        contents: [
            {
                id: 'dash_scrumboard',
                name: 'Scrumboard',
                icon: <Icons.LayoutKanban />,
                path: '/apps/taskboard',
                childrens: [
                    {
                        name: 'Kanban Board',
                        path: '/apps/taskboard/kanban-board',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Summary',
                        path: '/apps/taskboard/summary',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Pipeline',
                        path: '/apps/taskboard/pipeline',
                        grp_name: 'crm',
                    },
                ]
            },
            {
                id: 'dash_contact',
                name: 'Contacts',
                icon: <Icons.Notebook />,
                path: '/apps/contacts',
                childrens: [
                    {
                        name: 'Contact List',
                        path: '/apps/contacts/contact-list',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Contact Cards',
                        path: '/apps/contacts/contact-cards',
                        grp_name: 'crm',
                    },
                ]
            },
            {
                name: 'Opportunities',
                icon: <Icons.ArrowUpCircle />,
                path: '/apps/opportunities',
                grp_name: 'crm',
            },
            {
                name: 'Customers',
                icon: <Icons.Users />,
                path: '/apps/customers',
                grp_name: 'crm',
            },
            {
                id: 'dash_logistics',
                name: 'Logistics',
                icon: <Icons.Package />,
                path: '/apps/logistics',
                childrens: [
                    {
                        name: 'Equipment',
                        path: '/apps/logistics/equipment',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Stock Locations',
                        path: '/apps/logistics/stock-locations',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Crew Members',
                        path: '/apps/logistics/crew-members',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Vehicles',
                        path: '/apps/logistics/vehicles',
                        grp_name: 'crm',
                    },
                    {
                        id: 'dash_logistics_maintenance',
                        name: 'Maintenance',
                        childrens: [
                            {
                                name: 'Repairs',
                                path: '/apps/logistics/maintenance/repairs',
                                grp_name: 'crm',
                            },
                            {
                                name: 'Inspections',
                                path: '/apps/logistics/maintenance/inspections',
                                grp_name: 'crm',
                            },
                            {
                                name: 'Lost Equipment',
                                path: '/apps/logistics/maintenance/lost-equipment',
                                grp_name: 'crm',
                            },
                            {
                                name: 'Inventory Counts',
                                path: '/apps/logistics/maintenance/inventory-counts',
                                grp_name: 'crm',
                            },
                        ]
                    },
                ]
            },
            {
                name: 'Calendar',
                icon: <Icons.CalendarTime />,
                path: '/apps/calendar',
                grp_name: 'crm',
            },
            {
                id: 'dash_tasks',
                name: 'Tasks',
                icon: <Icons.ListDetails />,
                path: '/apps/tasks',
                childrens: [
                    {
                        name: 'Task List',
                        path: '/apps/tasks/task-list',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Gantt',
                        path: '/apps/tasks/gantt',
                        grp_name: 'crm',
                    },
                ]
            },
            {
                id: 'dash_accounts',
                name: 'Accounts',
                icon: <Icons.FileDigit />,
                path: '/apps/accounts',
                childrens: [
                    {
                        name: 'Invoice List',
                        path: '/apps/accounts/invoice-list',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Invoice Templates',
                        path: '/apps/accounts/invoice-templates',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Create Invoice',
                        path: '/apps/accounts/create-invoice',
                        grp_name: 'crm',
                    },
                    {
                        name: 'Invoice Preview',
                        path: '/apps/accounts/invoice-preview',
                        grp_name: 'crm',
                    },
                ]
            },
        ]
    },
    {
        group: 'Account',
        contents: [
            {
                id: 'dash_profile',
                name: 'Profile',
                icon: <Icons.UserSearch />,
                path: '/pages',
                childrens: [
                    {
                        name: 'Profile',
                        path: '/pages/profile',
                        grp_name: 'account',
                    },
                    // {
                    //     name: 'Edit Profile',
                    //     path: '/pages/edit-profile',
                    //     grp_name: 'account',
                    // },
                ]
            },
            {
                name: 'Settings',
                icon: <Icons.Adjustments />,
                path: '/settings',
                grp_name: 'account',
            },
        ]
    },
];
