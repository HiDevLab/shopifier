import { Component, Pipe, PipeTransform } from 'angular2/core';
import { CanActivate } from 'angular2/router'

import { getCurrentUser } from './admin.auth'
import { Nav1, Nav2 } from './nav'

@Pipe({name: 'parentNav'})
export class ParentNavPipe {
    transform(nav1, nav2){
        return false;
  }
}



@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
  selector: 'admin-form',
  templateUrl: 'templates/admin.html',
})
export class Admin {
    navs1 = Nav1;
    navs2 = Nav2;
    selectedNav1 = Nav1[0];
    displayNav2 = 'hide-class';
    
    onSelect1(nav1) {
        this.selectedNav1 = nav1;
        console.log(nav1);
    }
}

