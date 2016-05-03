import { Component } from 'angular2/core';
import { CanActivate } from 'angular2/router'

import { CheckCurrentUser } from './admin.auth'

@Component({
  selector: 'admin-form',
  templateUrl: 'templates/admin.html',
})
//@CanActivate(() => CheckCurrentUser())
export class Admin {
}
