import { Component, Pipe, PipeTransform } from 'angular2/core';
import { CanActivate } from 'angular2/router'
import { FORM_DIRECTIVES, NgFor, ngIf } from 'angular2/common';

import { getCurrentUser } from './admin.auth'
import { Nav } from './nav'

@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
    selector: 'admin-form',
    templateUrl: 'templates/admin.html',
    directives    : [FORM_DIRECTIVES],
})
export class Admin {
    navs = Nav;
    selectedNav = Nav[1];
    selectedSubNav = null;
    headerNav = [Nav[1]];
    
    forceSubmenuShow = false;
     
    onSelect(nav) {
        this.selectedNav = nav;
        this.forceSubmenuShow=true;
        this.headerNav = [nav];
               
        if (nav.submenu.length > 0) {
            this.selectedSubNav = nav.submenu[0];            
            this.headerNav[1] = this.selectedSubNav;
        }
        else {
            this.selectedSubNav = null;
        }
        setTimeout(() => {this.forceSubmenuShow = false;}, 1000, this);   

    }
    
    onSelectSubNav(subnav) {
        this.selectedSubNav = subnav;
        this.headerNav[1] = this.selectedSubNav;
    }
    
    onSelectHeader(headnav) {
        let i = this.headerNav.indexOf(headnav);
        this.onSelect(this.headerNav[0]);
        if (i > 0)
            this.onSelectSubNav(this.headerNav[1]);
    }
}
