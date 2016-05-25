import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES, Router, RouteConfig, CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES, NgFor, ngIf } from 'angular2/common';
import { Location } from 'angular2/platform/common';

import { getCurrentUser, AdminAuthService, AdminUtils } from './admin.auth'
import { Nav, PopUpMenu } from './nav'
import { AdminSettings, AdminAccountInvite } from './admin.settings'

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
        return [[Router], [AdminAuthService], [Location]];
    }
        
    constructor(router, authService, location) {
        this._auth = authService;//window.injector.get(AdminAuthService);
        this._router = router;
        this._location = location;
        
    }
   
    ngOnInit() {
        //this._router.navigate(['Home']);
        this._auth.getCurrentUser().then(data => this.currentUser = data );
        /*
        this._auth.get('/api/current-user/')
            .subscribe( data => {this.currentUser = data; this._auth.currentUser=data;} );
        */               
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
                this._router.navigate([nav.url]);
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
        this.selectedNav = this.navs[i];
        this.selectedSubNav = this.selectedNav.submenu[j]
        fio.icon = this.selectedSubNav.icon;
        this.headerNav = [this.selectedNav, this.selectedSubNav, fio]; 
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
                    this.selectedNav = this.navs[i]
                    this.selectedSubNav = null;
                    this.headerNav = [this.selectedNav];
                }
            }
        }
        
        if (addition) {
            addition.icon = this.headerNav[this.headerNav.length-1].icon;
            this.headerNav.push(addition);
        }
        
    }
}
