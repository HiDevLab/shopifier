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
    selectedIcon = Nav[1].icon;
    selectedText = Nav[1].text;
    
    
    forceSubmenuShow = false;
     
    onSelect(nav) {
        this.selectedNav = nav;
        this.forceSubmenuShow=true;
               
        if (nav.submenu.length > 0) {
            this.selectedSubNav = nav.submenu[0];            
            this.selectedIcon = this.selectedSubNav.icon; 
            this.selectedText = this.selectedSubNav.text
    
        }
        else {
            this.selectedSubNav = null;
            this.selectedIcon = nav.icon;
            this.selectedText = nav.text
    
        }
        setTimeout(() => {this.forceSubmenuShow = false;}, 1000, this);   

    }
    
    onSelectSubNav(nav) {
        this.selectedSubNav = nav;
        this.selectedIcon = nav.icon; 
        this.selectedText = nav.text;
    }
}
