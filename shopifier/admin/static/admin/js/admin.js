import { Component } from 'angular2/core';
import { CanActivate } from 'angular2/router'

import { getCurrentUser } from './admin.auth'

@CanActivate(() => getCurrentUser(true, 'Login'))
@Component({
  selector: 'admin-form',
  templateUrl: 'templates/admin.html',
})
export class Admin {
}
