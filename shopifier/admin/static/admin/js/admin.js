import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES, Router, RouteConfig, CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES, NgFor, ngIf } from 'angular2/common';

import { getCurrentUser, AdminAuthService } from './admin.auth'
import { Nav, PopUpMenu } from './nav'
import { AdminSettings, AdminAccountInvite } from './admin.settings'

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

    headerButtons = [];


    static get parameters() {
        return [[Router], [AdminAuthService]];
    }
        
    constructor(router, authService) {
        this._authService = authService;//window.injector.get(AdminAuthService);
        this._router = router;
        
    }
   
    ngOnInit() {
        //this._router.navigate(['Home']);
        this._authService.admin = this;    
        this._authService.get('/api/current-user/')
            .subscribe( data => {this.currentUser = data; this._authService.currentUser=data;} );               
    }
 
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
             if (nav.url != '#')
                this._router.navigate([nav.url])        
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
    
    goProfile() {
        let link = ['Settings/Profile', {'id': this.currentUser.id }];
        this._router.navigate(link);        
    } 
    
    test(i,j, fio) {
         this.selectedNav = this.navs[i]
         this.selectedSubNav = this.selectedNav.submenu[j]
         fio.icon = this.selectedSubNav.icon
         this.headerNav = [this.selectedNav, this.selectedSubNav, fio];
         
    }

}
