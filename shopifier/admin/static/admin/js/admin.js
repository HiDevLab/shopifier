import { Component, Pipe, PipeTransform } from 'angular2/core';
import { CanActivate } from 'angular2/router'
import { NgFor } from 'angular2/common';

import { getCurrentUser } from './admin.auth'
import { Nav } from './nav'

@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
    selector: 'admin-form',
    templateUrl: 'templates/admin.html',
})
export class Admin {
    navs = Nav;
    selectedNav = Nav[1];
    selectedSubNav = null;
    forceSubmenuShow = false;
     
    onSelect(nav) {
        this.selectedNav = nav;
    }
    onSelectSubNav(nav) {
        this.selectedSubNav = nav;
    }
}
