import { Component } from 'angular2/core';
import { Router, RouteConfig, ROUTER_DIRECTIVES, RouterOutlet, ROUTER_PROVIDERS, CanActivate } from 'angular2/router'

import { AdminAccount } from './admin.account'
 
@Component({
  selector: 'settings',
  template : '<router-outlet>111</router-outlet>',
  directives: [RouterOutlet],
})
@RouteConfig([
    {
        path : '/account',
        name : 'Account',
        component : AdminAccount,
    },
    
])
export class AdminSettings {
}
