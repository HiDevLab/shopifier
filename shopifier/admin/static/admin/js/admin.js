import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES, Router, RouteConfig, CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES } from 'angular2/common';
import { Location } from 'angular2/platform/common';

import { getCurrentUser, AdminAuthService, AdminUtils } from './admin.auth'
import { Nav, PopUpMenu } from './nav'

import { AdminOrders } from './admin.orders'
import { AdminProducts } from './admin.products'
import { AdminSettings, AdminAccountInvite } from './admin.settings'
import { Customers, CustomersNew, CustomersEdit } from './admin.customers'


//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminHome {
    component = 'Home';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}

//------------------------------------------------------------------------------
@Component({selector: 'main', templateUrl: 'templates/temporarily.html',})
export class AdminSearch {
    component = 'Search';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
    selector: 'admin',
    templateUrl: 'templates/admin.html',
    directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
    {
        path : '/',
        redirectTo: ['Home'],
    }, 
     
    {
        path : '/home',
        name : 'Home',
        component : AdminHome
    },

    {
        path : '/search',
        name : 'Search',
        component : AdminSearch
    },

    {
        path : '/orders/...',
        name : 'Orders',
        component : AdminOrders,
    },

    {
        path : '/settings/...',
        name : 'Settings',
        component : AdminSettings,
    },

    {
        path : '/products/...',
        name : 'Products',
        component : AdminProducts,
    },

    {
        path : '/customers',
        name : 'Customers',
        component : Customers,
    },
    {
        path : '/customers/new',
        name : 'NewCustomer',
        component : CustomersNew,
    },
    {
        path : '/customers/:id',
        name : 'EditCustomer',
        component : CustomersEdit,
    },
])
export class Admin {
    navs = Nav;
    popups = PopUpMenu;
    selectedNav = Nav[1];
    selectedSubNav = undefined;
    headerNav = [Nav[1]];
    
    forceSubmenuShow = false;
    forcePopupShow = false;
    
    currentUser = undefined;

    headerButtons = [];
    
    footerShow = false;
    footerText = '';
    cacheNav = undefined;
    cacheSubNav = undefined;
    cacheHeaderNav = undefined;
    
    static get parameters() {
        return [[Router], [AdminAuthService], [Location]];
    }
        
    constructor(router, authService, location) {
        this._auth = authService;//window.injector.get(AdminAuthService);
        this._router = router;
        this._location = location;
        
    }
   
    ngOnInit() {
        this._auth.getCurrentUser().then(data => {this.currentUser = data;} );
    }
    
    refreshCurrentUser() {
        this._auth.refreshCurrentUser().then(data => {this.currentUser = data;});
    }

    onSelect(nav) {
        this.forceSubmenuShow=true;

        let subnav = undefined;
        if (nav.submenu.length > 0) {
            subnav = nav.submenu[0];
        }
        this.changeNav(nav, subnav);

        setTimeout(() => {this.forceSubmenuShow = false;}, 1000, this);
    }

    onSelectSubNav(subnav) {
        this.changeNav(this.selectedNav, subnav);
    }

    changeNav(nav, subnav) {
        let url = (subnav) ? subnav.url : nav.url;
        if (this.notNavigate) {
            let self = this;
            this._router.navigate([url])
                .then(()=> {
                    if (!self.notNavigate) {
                        self.selectedSubNav = subnav;
                        self.selectedNav = nav;
                        if (subnav)
                            self.headerNav = [nav, subnav];
                        else
                            self.headerNav = [nav];
                    }
                }
            );
        }
        else {
            this.selectedSubNav = subnav;
            this.selectedNav = nav;
            if (subnav)
                this.headerNav = [nav, subnav];
            else
                this.headerNav = [nav];
            this._router.navigate([url]);
        }
    }

    onSelectHeader(headnav) {
        let b = Object.is(headnav, this.selectedSubNav);
        this.onSelect(this.selectedNav);
        if (b) {
            this.onSelectSubNav(headnav);
        }
    }
    
    goProfile() {
        let link = ['Settings/Profile', {'id': this.currentUser.id }];
        this._router.navigate(link);
    } 
    

    currentUrl (addition) {
        let url = '/admin' + this._location.path();
        url = url.toUpperCase()
        let s;
        for (let i = 0; i < this.navs.length; i++) {
            if (this.navs[i].submenu.length > 0) {
                for (let j = 0; j < this.navs[i].submenu.length; j++) {
                    s = this.navs[i].submenu[j].url.toUpperCase();
                    if (url.indexOf(s) + 1 ) {
                        this.selectedNav = this.navs[i];
                        this.selectedSubNav = this.selectedNav.submenu[j];
                        this.headerNav = [this.selectedNav, this.selectedSubNav];
                    }
                }
            }
            else {
                s = this.navs[i].url.toUpperCase();
                if (url.indexOf(s) + 1 ) {
                    this.selectedNav = this.navs[i];
                    this.selectedSubNav = undefined;
                    this.headerNav = [this.selectedNav];
                    setTimeout(() => { this.forceSubmenuShow = false;}, 800, this); 
                }
            }
        }
        
        if (addition) {
            addition.icon = this.headerNav[this.headerNav.length-1].icon;
            this.headerNav.push(addition);
        }
    }
    
    footer(text) {
        this.footerShow = true;
        this.footerText = text;
        setTimeout(() => {  this.footerShow = false;
                        }, 1000, this);
    }
}
