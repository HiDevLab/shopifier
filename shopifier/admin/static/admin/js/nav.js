export var Nav1 = [
    {'id': 1, 'icon': 'fa fa-envelope',      'child': false,  'text': 'Search',    'url': '/'},
    {'id': 2, 'icon': 'fa fa-envelope',      'child': false,  'text': 'Home',      'url': '/'},
    {'id': 3, 'icon': 'fa fa-envelope',      'child': true,   'text': 'Orders',    'url': '/'},
    {'id': 4, 'icon': 'fa fa-envelope',      'child': true,   'text': 'Products',  'url': '/'},
    {'id': 5, 'icon': 'fa fa-envelope',      'child': false,  'text': 'Customers', 'url': '/'},
    {'id': 6, 'icon': 'fa fa-envelope',      'child': false,  'text': 'Reports',   'url': '/'},
    {'id': 7, 'icon': 'fa fa-envelope',      'child': false,  'text': 'Discounts', 'url': '/'},
    {'id': 8, 'icon': 'fa fa-envelope',      'child': true,   'text': 'Settings',  'url': '/'}
];

export var Nav2 = [
    {'id': 10, 'parent': 3, 'text': 'Orders',       'url': '/',     'parameters': {'action':''} },
    {'id': 11, 'parent': 3, 'text': 'Drafts',       'url': '/',     'parameters': {'action':''} },
    {'id': 12, 'parent': 4, 'text': 'Products',     'url': '/',     'parameters': {'action':''} },
    {'id': 13, 'parent': 4, 'text': 'Transfers',    'url': '/',     'parameters': {'action':''} },
    {'id': 14, 'parent': 8, 'text': 'General',      'url': '/',     'parameters': {'action':''} },
    {'id': 15, 'parent': 8, 'text': 'Payments',     'url': '/',     'parameters': {'action':''} },
    {'id': 16, 'parent': 8, 'text': 'Checkout',     'url': '/',     'parameters': {'action':''} },
    {'id': 17, 'parent': 8, 'text': 'Shipping',     'url': '/',     'parameters': {'action':''} }, 
];