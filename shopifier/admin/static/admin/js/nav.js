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
        'permission': ['orders'],
        'submenu': [
             {
                 'icon': 'calendar-check-o',
                 'text': 'Orders',
                 'url': '/orders/orders',
                 'uri': '/admin/orders',
             },
             {
                 'icon': 'calendar-check-o',
                 'text': 'Drafts',
                 'url': '/orders/drafts',
                 'uri': '/admin/orders/drafts',
             },
        ],
    },
    {
        'icon': 'tag',
        'text': 'Products',
        'url': '#',
        'permission': ['products', 'transfers', 'collections'],
        'submenu': [
             {
                'icon': 'tag',
                'text': 'Products',
                'url': '/products',
                'uri': '/admin/products',
                'type': 'router',
                'permission': ['products'],
             },
             {
                'icon': 'truck',
                'text': 'Transfers',
                'url': '/transfers',
                'uri': '/admin/transfers',
                'type': 'router',
                'permission': ['transfers'],
             },
             {
                'icon': 'tag',
                'text': 'Collections',
                'url': '/collections',
                'uri': '/admin/collections',
                'type': 'component',
                'permission': ['collections'],
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
        'permission': ['customers'],
    },
    {
        'icon': 'cog',
        'text': 'Settings',
        'url': '##',
        'permission': ['settings'],
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


// the table of correspondence component's name and account.permissions
export var ComponentPermission = {
    'AdminSettingsGeneral': 'settings',
    'AdminSettingsCheckout': 'settings',
    'AdminAccount': 'settings',
    'AdminAccountProfile': 'settings',
    'AdminCustomers': 'customers',
    'AdminCustomersNew': 'customers',
    'AdminCustomersEdit': 'customers',
    'AdminOrdersOrders': 'orders',
    'AdminOrdersDrafts': 'orders',
    'AdminProducts': 'products',
    'AdminProductsNew': 'customers',
    'AdminProductsEdit': 'customers',
    'AdminTransfers': 'transfers',
    'AdminCollections': 'collections',
    'AdminCollectionsNew': 'collections',
    'AdminCollectionsEdit': 'collections',
}; 


export var PopUpMenu = [
    { 'text': 'Shopifier Live Chat', 'url': '#' },
    { 'text': 'Shopifier Help Center', 'url': '#' },
    { 'text': 'Community Forums', 'url': '#' },
    { 'text': 'Hire an expert', 'url': '#' },
    { 'text': 'Keyboard shortcuts', 'url': '#' }  
];