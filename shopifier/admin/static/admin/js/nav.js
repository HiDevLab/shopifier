export var Nav = [
    {
        'icon': 'search',
        'text': 'Search',
        'url': '/search',
        'uri': '/admin/search',
        'submenu': [],
    },
    {
        'icon': 'home',
        'text': 'Home',
        'url': '/home',
        'uri': '/admin/home',
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
                 'url': '/orders/orders',
                 'uri': '/admin/orders/orders',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Drafts',
                 'url': '/orders/drafts',
                 'uri': '/admin/orders/drafts',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Transfers',
                 'url': '/orders/transfers',
                 'uri': '/admin/orders/drafts',
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
                 'url': '/Admin/Products',
                 'uri': '/admin/products',
                 'type': 'router',
             },
             {
                 'icon': 'truck',
                 'text': 'Transfers',
                 'url': '/Admin/Transfers',
                 'uri': '/admin/transfers',
                 'type': 'router',
             },
             {
                 'icon': 'tag',
                 'text': 'Collections',
                 'url': '/Admin/Collections',
                 'uri': '/admin/products/collections',
                 'type': 'component',
             }
        ],
    },
    {
        'icon': 'users',
        'text': 'Customers',
        'url': '/customers',
        'uri': '/admin/customers',
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
                 'url': '/settings/general',
                 'uri': '/admin/settings/general',
                 'type': 'component',
             },
             {
                 'icon': 'shopping-cart',
                 'text': 'Checkout',
                 'url': '/settings/checkout',
                 'uri': '/admin/settings/checkout',
                 'type': 'component',
             },
             {
                 'icon': 'cog',
                 'text': 'Account',
                 'url': '/settings/account',
                 'uri': '/admin/settings/account',
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