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
                name: 'Contacts',
                icon: <Icons.Notebook />,
                path: '/apps/contacts/contact-list',
                grp_name: 'sales',
            },
            {
                name: 'Companies',
                icon: <Icons.Building />,
                path: '/apps/contacts/companies',
                grp_name: 'sales',
            },
            {
                name: 'Groups',
                icon: <Icons.Users />,
                path: '/apps/contacts/groups',
                grp_name: 'sales',
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
                name: 'Reports',
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
            {
                name: 'Calendar',
                icon: <Icons.CalendarEvent />,
                path: '/apps/jira/calendar',
                grp_name: 'jira',
            },
        ]
    },

    // ── Logistics ─────────────────────────────────────────────────────────────
    {
        group: 'Logistics',
        contents: [
            {
                name: 'Requests',
                icon: <Icons.ClipboardList />,
                path: '/apps/logistics/requests',
                grp_name: 'logistics',
            },
            {
                name: 'Equipment',
                icon: <Icons.Tool />,
                path: '/apps/logistics/equipment',
                grp_name: 'logistics',
            },
            {
                name: 'Stock Locations',
                icon: <Icons.MapPin />,
                path: '/apps/logistics/stock-locations',
                grp_name: 'logistics',
            },
            {
                name: 'Crew Members',
                icon: <Icons.UserCheck />,
                path: '/apps/logistics/crew-members',
                grp_name: 'logistics',
            },
            {
                name: 'Vehicles',
                icon: <Icons.Car />,
                path: '/apps/logistics/vehicles',
                grp_name: 'logistics',
            },
            {
                id: 'dash_logistics_maintenance',
                name: 'Maintenance',
                icon: <Icons.Tools />,
                path: '/apps/logistics/maintenance',
                childrens: [
                    {
                        name: 'Repairs',
                        path: '/apps/logistics/maintenance/repairs',
                        grp_name: 'logistics',
                    },
                    {
                        name: 'Inspections',
                        path: '/apps/logistics/maintenance/inspections',
                        grp_name: 'logistics',
                    },
                    {
                        name: 'Lost Equipment',
                        path: '/apps/logistics/maintenance/lost-equipment',
                        grp_name: 'logistics',
                    },
                    {
                        name: 'Inventory Counts',
                        path: '/apps/logistics/maintenance/inventory-counts',
                        grp_name: 'logistics',
                    },
                ]
            },
        ]
    },

       // ── Finance ──────────────────────────────────────────────────────────────
    {
        group: 'Finance',
        contents: [
            {
                name: 'Invoice List',
                icon: <Icons.FileDigit />,
                path: '/apps/accounts/invoice-list',
                grp_name: 'accounts',
            },
            {
                name: 'Invoice Templates',
                icon: <Icons.LayoutGrid />,
                path: '/apps/accounts/invoice-templates',
                grp_name: 'accounts',
            },
            {
                name: 'Create Invoice',
                icon: <Icons.FilePlus />,
                path: '/apps/accounts/create-invoice',
                grp_name: 'accounts',
            },
            {
                name: 'Invoice Preview',
                icon: <Icons.Eye />,
                path: '/apps/accounts/invoice-preview',
                grp_name: 'accounts',
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
