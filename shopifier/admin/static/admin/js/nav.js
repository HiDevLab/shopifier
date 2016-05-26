export var Nav = [
    {
        'icon': 'search',
        'text': 'Search',
        'url': '#',
        'submenu': [],
    },
    {
        'icon': 'home',
        'text': 'Home',
        'url': '/Admin/Home',
        'submenu': [],
    },
    {
        'icon': 'calendar-check-o',
        'text': 'Orders',
        'url': '#',
        'submenu': [
             {
                 'icon': 'calendar-check-o',
                 'text': 'Orders',
                 'url': '#',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Drafts',
                 'url': '#',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Transfers',
                 'url': '#',
             }
        ],
    },
    {
        'icon': 'tag',
        'text': 'Products',
        'url': '#',
        'submenu': [
             {
                 'icon': 'tag',
                 'text': 'Products',
                 'url': '#',
                 'type': 'router',
             },
             {
                 'icon': 'truck',
                 'text': 'Transfers',
                 'url': '#',
                 'type': 'router',
             },
             {
                 'icon': 'tag',
                 'text': 'Collections',
                 'url': '#',
                 'type': 'component',
             }
        ],
    },
    {
        'icon': 'cog',
        'text': 'Settings',
        'url': '##',
        'submenu': [
             {
                 'icon': 'cog',
                 'text': 'General',
                 'url': '###',
                 'type': 'component',
             },
             {
                 'icon': 'shopping-cart',
                 'text': 'Checkout',
                 'url': '#',
                 'type': 'component',
             },
             {
                 'icon': 'cog',
                 'text': 'Account',
                 'url': '/Admin/Settings/Account',
                 'type': 'component',
             }
        ],
    }
];


export var PopUpMenu = [
    { 'text': 'Shopifier Live Chat', 'url': '#' },
    { 'text': 'Shopifier Help Center', 'url': '#' },
    { 'text': 'Community Forums', 'url': '#' },
    { 'text': 'Hire an expert', 'url': '#' },
    { 'text': 'Keyboard shortcuts', 'url': '#' }  
];