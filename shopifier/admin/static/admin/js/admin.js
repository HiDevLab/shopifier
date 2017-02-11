import { Location } from '@angular/common'
import { Component, Pipe, Injectable } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router'

import { PopUpMenuCollection} from './components';
import { Nav, PopUpMenu, ComponentPermission } from './nav'

import { AdminAuthService, AdminUtils } from './admin.auth'
import { Customers, CustomersNew, CustomersEdit } from './admin.customers'
import { AdminOrders } from './admin.orders'
import { Products, ProductsNew, ProductsEdit,
    AdminProductsTransfers, AdminProductsCollections } from './admin.products';
import { AdminSettings, AdminAccountInvite } from './admin.settings'



//------------------------------------------------------------------------------AdminHome
@Component({
    selector: 'main',
    templateUrl: 'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminHome {
    component = 'Home';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl(); this._admin.headerButtons = [];}
}

//------------------------------------------------------------------------------AdminSearch
@Component({
    selector: 'main', templateUrl:
    'templates/temporarily.html',
    interpolation: ['[[', ']]'],
})
export class AdminSearch {
    component = 'Search';
    static get parameters() {return [[Admin]];}
    constructor(admin) {this._admin = admin;}
    ngOnInit() {this._admin.currentUrl(); this._admin.headerButtons = [];}
}


//------------------------------------------------------------------------------PermissionsPipe
@Pipe({
    name: 'permissions',
    pure: false,
})
export class PermissionsPipe {
    transform(list, permissions) {
        return list.filter( 
            val => {
                if (
                    !val.permission ||
                    (permissions && permissions.length && permissions[0] === 'full')
                ) {
                    return true;
                }
                let ret = false;
                val.permission.forEach( perm => {
                    if (permissions.includes(perm)) {
                        ret = true;
                    }
                });
                return ret;
            }
        );
    }
}


//------------------------------------------------------------------------------CheckPermission
@Injectable()
export class CheckPermission {
    static get parameters() {
        return [[AdminAuthService]];
    }

    constructor(authService, router) {
        this._auth = authService;
    }

    canActivate(rs, route, state) {
        return this._auth.getCurrentUser()
        .then( () =>  {
            let perm = ComponentPermission[rs.component.name];
            if (!perm) {
                return true; //privileges are not required
            }
            if (this._auth.permissions && this._auth.permissions.length && this._auth.permissions[0] === 'full') {
                return true; //full permissions
            }
            if(this._auth.permissions.includes(perm)) {
                return true;
            } else {
                if (!this._auth.selectedNav) {
                    this._auth.changeNav(Nav[1]);
                } else { //find first available submenu
                    for (let i = 0; i < this._auth.selectedNav.submenu.length; i++) {
                        if (this._auth.permissions.includes(this._auth.selectedNav.submenu[i].permission[0])) {
                            this._auth.changeNav(this._auth.selectedNav, this._auth.selectedNav.submenu[i]);
                            return false;
                        }
                    }
                }
                this._auth.changeNav(Nav[1]);
                return false;
            }
        });
    }
}


//------------------------------------------------------------------------------Admin
@Component({
    selector: 'body',
    templateUrl: 'templates/admin.html',
    interpolation: ['[[', ']]'],
})
export class Admin {
    navs = Nav;
    headerNav = [Nav[1]];
    selectedNav = Nav[1];
    selectedSubNav = undefined;

    permissions = [];

    popups = PopUpMenu;
    menus = new PopUpMenuCollection;

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
        this._auth.changeNav = this.changeNav.bind(this);
    }

    ngOnInit() {
        this._auth.getCurrentUser().then(
            data => {
                this.currentUser = data;
                this.settings = JSON.parse(data['settings']);
                this.permissions = data.permissions;
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
                .then( () => {
                    if (!this.notNavigate) {
                        this.selectedSubNav = subnav;
                        this.selectedNav = nav;
                        if (subnav) {
                            if (subnav.type == 'router') {
                                this.headerNav = [subnav];
                            } else {
                                this.headerNav = [nav, subnav];
                            }
                        } else {
                            this.headerNav = [nav];
                        }
                    }
                }
            );
        }
        else {
            this.selectedSubNav = subnav;
            this.selectedNav = nav;
            if (subnav) {
                if (subnav.type == 'router') {
                    this.headerNav = [subnav];
                } else {
                    this.headerNav = [nav, subnav];
                }
            } else {
                this.headerNav = [nav];
            }
            this._router.navigate([url]);
        }
        this._auth.selectedNav = this.selectedNav;
    }

    onSelectHeader(headnav) {
        let b = Object.is(headnav, this.selectedSubNav);
        this.onSelect(this.selectedNav);
        if (b) {
            this.onSelectSubNav(headnav);
        }
    }

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
