import { Component } from 'angular2/core';
import { Router, RouterOutlet, RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES, NgFor, ngIf } from 'angular2/common';

import { getCurrentUser,AdminAuthService } from './admin.auth'
import { Nav, PopUpMenu } from './nav'
import { AdminSettings } from './admin.settings'

//------------------------------------------------------------------------------
@Component({
    selector:   'main',
    template:   '',
})
export class AdminHome {  
}

//------------------------------------------------------------------------------
@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
    selector: 'admin-form',
    templateUrl: 'templates/admin.html',
    directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
       
    {
        path : '/home',
        name : 'Home',
        component : AdminHome,
    },

    {
        path : '/settings/...',
        name : 'Settings',
        component : AdminSettings,
    },
  
])
export class Admin {
    navs = Nav;
    popups = PopUpMenu;
    selectedNav = Nav[1];
    selectedSubNav = null;
    headerNav = [Nav[1]];
    
    forceSubmenuShow = false;
    forcePopupShow = false;
    
    currentUser = null;

    static get parameters() {
        return [[Router]];
    }
        
    constructor(router) {
        let _authService = window.injector.get(AdminAuthService);
        this._router = router;
        
        _authService.get(`/api/current-user/`)
            .subscribe( data => this.currentUser = data );               
    }
/*    
    ngOnInit() {
        this._router.navigate(['Home']);
    }
*/ 
    onSelect(nav) {
        this.selectedNav = nav;
        this.forceSubmenuShow=true;
               
        if (nav.submenu.length > 0) {
            this.selectedSubNav = nav.submenu[0];            
            this.onSelectSubNav(this.selectedSubNav);
        }
        else {
            this.selectedSubNav = null;
            this.headerNav =[this.selectedNav];        
        }
                
        setTimeout(() => {this.forceSubmenuShow = false;}, 1000, this);   
    }
    
    onSelectSubNav(subnav) {
        this.selectedSubNav = subnav;
        
        if (subnav.type=='router')
            this.headerNav = [this.selectedSubNav];
        else 
            this.headerNav = [this.selectedNav, this.selectedSubNav];
        
        if (subnav.url != '#')
            this._router.navigate([subnav.url])
    }
    
    onSelectHeader(headnav) {
        let i = this.headerNav.indexOf(headnav);
        this.onSelect(this.headerNav[0]);
        if (i > 0)
            this.onSelectSubNav(this.headerNav[1]);
    }
}
