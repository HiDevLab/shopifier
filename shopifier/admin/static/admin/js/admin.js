import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES, Router, RouteConfig, CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES, NgFor, ngIf } from 'angular2/common';
import { Location } from 'angular2/platform/common';

import { getCurrentUser, AdminAuthService, AdminUtils } from './admin.auth'
import { Nav, PopUpMenu } from './nav'
import { AdminSettings, AdminAccountInvite } from './admin.settings'
import { Customers, CustomersNew} from './admin.customers'

//------------------------------------------------------------------------------
@Component({
    selector:   'main',
    template:   '',
})
export class AdminHome {
        static get parameters() {
        return [[Admin]];
    }
    constructor(admin) {
        this._admin = admin;
    }
    ngOnInit() {
        this._admin.currentUrl();
    }
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
        component : AdminHome //AdminAccountInvite,// AdminHome,
    },

    {
        path : '/settings/...',
        name : 'Settings',
        component : AdminSettings,
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
        this.selectedNav = nav;
        this.forceSubmenuShow=true;
               
        if (this.selectedNav.submenu.length > 0) {
            this.selectedSubNav = this.selectedNav.submenu[0];
            this.onSelectSubNav(this.selectedSubNav);
        }
        else {
            this.selectedSubNav = undefined;
            this.headerNav =[this.selectedNav];
            if (this.selectedNav.url.indexOf('#') < 0) {
                this._router.navigate([this.selectedNav.url]);
            }
        }
        setTimeout(() => {this.forceSubmenuShow = false;}, 1000, this); 
    }
    
    onSelectSubNav(subnav) {
        this.selectedSubNav = subnav;
        
        if (subnav.type=='router')
            this.headerNav = [this.selectedSubNav];
        else 
            this.headerNav = [this.selectedNav, this.selectedSubNav];
        
        if (subnav.url.indexOf('#') < 0) {
            let link = 
            this._router.navigate([subnav.url]);
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
