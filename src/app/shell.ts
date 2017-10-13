import {Component} from '@angular/core'

@Component({
  selector: 'rv-app',
  template: `
    <nav>
      <a routerLink="/" routerLinkActive="active">Home</a>
      <a routerLink="/tmp" routerLinkActive="active">Tmp</a>
    </nav>
    <router-outlet></router-outlet>`
})
export class AppShellContainer {}
