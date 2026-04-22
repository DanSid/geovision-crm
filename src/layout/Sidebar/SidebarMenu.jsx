import * as Icons from 'tabler-icons-react';

export const SidebarMenu = [
    // ── Dashboard ─────────────────────────────────────────────────────────────
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

    // ── Sales ─────────────────────────────────────────────────────────────────
    {
        group: 'Sales',
        contents: [
            {
                id: 'dash_contacts',
                name: 'Contacts',
                icon: <Icons.Notebook />,
                path: '/apps/contacts',
                childrens: [
                    {
                        name: 'Contact List',
                        path: '/apps/contacts/contact-list',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Companies',
                        path: '/apps/contacts/companies',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Groups',
                        path: '/apps/contacts/groups',
                        grp_name: 'sales',
                    },
                ]
            },
            {
                name: 'Calendar',
                icon: <Icons.CalendarTime />,
                path: '/apps/calendar',
                grp_name: 'sales',
            },
            {
                name: 'Opportunities',
                icon: <Icons.ArrowUpCircle />,
                path: '/apps/opportunities',
                grp_name: 'sales',
            },
            {
                name: 'Summary',
                icon: <Icons.ChartBar />,
                path: '/apps/taskboard/summary',
                grp_name: 'sales',
            },
            {
                name: 'Pipeline',
                icon: <Icons.LayoutColumns />,
                path: '/apps/taskboard/pipeline',
                grp_name: 'sales',
            },
            {
                name: 'Customers',
                icon: <Icons.Users />,
                path: '/apps/customers',
                grp_name: 'sales',
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
                        grp_name: 'sales',
                    },
                    {
                        name: 'Invoice Templates',
                        path: '/apps/accounts/invoice-templates',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Create Invoice',
                        path: '/apps/accounts/create-invoice',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Invoice Preview',
                        path: '/apps/accounts/invoice-preview',
                        grp_name: 'sales',
                    },
                ]
            },
            {
                id: 'dash_logistics',
                name: 'Logistics',
                icon: <Icons.Package />,
                path: '/apps/logistics',
                childrens: [
                    {
                        name: 'Requests',
                        path: '/apps/logistics/requests',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Equipment',
                        path: '/apps/logistics/equipment',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Stock Locations',
                        path: '/apps/logistics/stock-locations',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Crew Members',
                        path: '/apps/logistics/crew-members',
                        grp_name: 'sales',
                    },
                    {
                        name: 'Vehicles',
                        path: '/apps/logistics/vehicles',
                        grp_name: 'sales',
                    },
                    {
                        id: 'dash_logistics_maintenance',
                        name: 'Maintenance',
                        childrens: [
                            {
                                name: 'Repairs',
                                path: '/apps/logistics/maintenance/repairs',
                                grp_name: 'sales',
                            },
                            {
                                name: 'Inspections',
                                path: '/apps/logistics/maintenance/inspections',
                                grp_name: 'sales',
                            },
                            {
                                name: 'Lost Equipment',
                                path: '/apps/logistics/maintenance/lost-equipment',
                                grp_name: 'sales',
                            },
                            {
                                name: 'Inventory Counts',
                                path: '/apps/logistics/maintenance/inventory-counts',
                                grp_name: 'sales',
                            },
                        ]
                    },
                ]
            },
        ]
    },

    // ── Jira ──────────────────────────────────────────────────────────────────
    {
        group: 'Jira',
        contents: [
            {
                id: 'dash_tasks',
                name: 'Tasks',
                icon: <Icons.ListDetails />,
                path: '/apps/tasks',
                childrens: [
                    {
                        name: 'Task List',
                        path: '/apps/tasks/task-list',
                        grp_name: 'jira',
                    },
                    {
                        name: 'Gantt',
                        path: '/apps/tasks/gantt',
                        grp_name: 'jira',
                    },
                ]
            },
            {
                name: 'Kanban Board',
                icon: <Icons.LayoutKanban />,
                path: '/apps/taskboard/kanban-board',
                grp_name: 'jira',
            },
        ]
    },

    // ── Account ───────────────────────────────────────────────────────────────
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
