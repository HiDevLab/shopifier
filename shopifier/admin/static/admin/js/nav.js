export var Nav = [
    {
        'icon': 'search',
        'text': 'Search',
        'url': '/Admin/Search',
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
                 'url': '/Admin/Orders/Orders',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Drafts',
                 'url': '/Admin/Orders/Drafts',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Transfers',
                 'url': '/Admin/Orders/Transfers',
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
                 'url': '/Admin/Products/Products',
                 'type': 'router',
             },
             {
                 'icon': 'truck',
                 'text': 'Transfers',
                 'url': '/Admin/Products/Transfers',
                 'type': 'router',
             },
             {
                 'icon': 'tag',
                 'text': 'Collections',
                 'url': '/Admin/Products/Collections',
                 'type': 'component',
             }
        ],
    },
    {
        'icon': 'users',
        'text': 'Customers',
        'url': '/Admin/Customers',
        'type': 'router',
        'submenu': [],
    },
    {
        'icon': 'cog',
        'text': 'Settings',
        'url': '##',
        'submenu': [
             {
                 'icon': 'cog',
                 'text': 'General',
                 'url': '/Admin/Settings/General',
                 'type': 'component',
             },
             {
                 'icon': 'shopping-cart',
                 'text': 'Checkout',
                 'url': '/Admin/Settings/Checkout',
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