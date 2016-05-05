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
    //displayNav = 'hide-class';
    
    onSelect(nav) {
        this.selectedNav = nav;
    }
}
