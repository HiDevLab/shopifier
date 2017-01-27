import { Component } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router'
import { Location } from '@angular/common'

import { AdminAuthService, AdminUtils } from './admin.auth'
import { Nav, PopUpMenu } from './nav'

import { AdminOrders } from './admin.orders'
import { 
    Products, ProductsNew, ProductsEdit, AdminProductsTransfers, 
    AdminProductsCollections
} from './admin.products';
import { AdminSettings, AdminAccountInvite } from './admin.settings'
import { Customers, CustomersNew, CustomersEdit } from './admin.customers'


//------------------------------------------------------------------------------
@Component({
    selector: 'main',
    templateUrl: 'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminHome {
    component = 'Home';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}

//------------------------------------------------------------------------------
@Component({
    selector: 'main', templateUrl:
    'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminSearch {
    component = 'Search';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl();}
}


//------------------------------------------------------------------------------
@Component({
    selector: 'body',
    templateUrl: 'templates/admin.html',
    interpolation: ['[[', ']]'],
})
// @RouteConfig([
//     {
//         path : '/',
//         redirectTo: ['Home'],
//     }, 
//      
//     {
//         path : '/home',
//         name : 'Home',
//         component : AdminHome
//     },
// 
//     {
//         path : '/search',
//         name : 'Search',
//         component : AdminSearch
//     },
// 
//     {
//         path : '/orders/...',
//         name : 'Orders',
//         component : AdminOrders,
//     },
// 
//     {
//         path : '/settings/...',
//         name : 'Settings',
//         component : AdminSettings,
//     },
// 
//     {
//         path : '/products/collections',
//         name : 'Collections',
//         component : AdminProductsCollections
//     },
// 
//     {
//         path : '/products',
//         name : 'Products',
//         component : Products
//     },
//     {
//         path : '/products/new',
//         name : 'NewProduct',
//         component : ProductsNew,
//     },
//     {
//         path : '/products/:id',
//         name : 'EditProduct',
//         component : ProductsEdit,
//     },
//     {
//         path : '/transfers',
//         name : 'Transfers',
//         component : AdminProductsTransfers
//     },
// 
//     {
//         path : '/customers',
//         name : 'Customers',
//         component : Customers,
//     },
//     {
//         path : '/customers/new',
//         name : 'NewCustomer',
//         component : CustomersNew,
//     },
//     {
//         path : '/customers/:id',
//         name : 'EditCustomer',
//         component : CustomersEdit,
//     },
// ])
export class Admin {
    navs = Nav;
    popups = PopUpMenu;
    selectedNav = Nav[1];
    selectedSubNav = undefined;
    headerNav = [Nav[1]];

    forceSubmenuShow = false;
    forcePopupShow = false;

    currentUser = undefined;
    settings = undefined;

    headerButtons = [];

    footerShow = false;
    footerText = '';
    cacheNav = undefined;
    cacheSubNav = undefined;
    cacheHeaderNav = undefined;

    static get parameters() {
        return [[Router], [AdminAuthService], [Location], [ActivatedRoute]];
    }

    constructor(router, authService, location, params) {
        this._auth = authService;
        this._router = router;
        this._location = location;
        this._params = params.snapshot.params;
    }

    ngOnInit() {
        this._auth.getCurrentUser().then(
            data => {
                this.currentUser = data;
                this.settings = JSON.parse(data['settings']);
            }
        );
    }

    refreshCurrentUser() {
        this._auth.refreshCurrentUser()
            .then(data => {this.currentUser = data;});
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
                            if (subnav.type == 'router')
                                self.headerNav = [subnav];
                            else
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
                if (subnav.type == 'router')
                    this.headerNav = [subnav];
                else
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

//     goProfile() {
//         let link = ['Settings/Profile', {'id': this.currentUser.id }];
//         this._router.navigate(link);
//     }

    currentUrl (addition, levels) {
        let url = '/admin';
        if (levels) {
            let navs = this._location.path().split('/', levels + 1);    
            url += navs.join('/');
        }
        else {
            url += this._location.path();
        }
        url = url.toUpperCase()
        let s;
        for (let i = 0; i < this.navs.length; i++) {
            if (this.navs[i].submenu.length > 0) {
                for (let j = 0; j < this.navs[i].submenu.length; j++) {
                    s = this.navs[i].submenu[j].uri.toUpperCase();
                    if (url === s) {
                        this.selectedNav = this.navs[i];
                        this.selectedSubNav = this.selectedNav.submenu[j];
                        if (this.selectedSubNav.type == 'router')
                            this.headerNav = [this.selectedSubNav];
                        else
                            this.headerNav = [
                                this.selectedNav, this.selectedSubNav];
                        setTimeout(
                            () => {this.forceSubmenuShow = true;}, 800, this);
                        break;
                    }
                }
            }
            else {
                s = this.navs[i].uri.toUpperCase();
                if (url === s) {
                    this.selectedNav = this.navs[i];
                    this.selectedSubNav = undefined;
                    this.headerNav = [this.selectedNav];
                    setTimeout(
                        () => {this.forceSubmenuShow = false;}, 800, this);
                    break;
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
        setTimeout(
            () => {this.footerShow = false;}, 1000, this);
    }
}
