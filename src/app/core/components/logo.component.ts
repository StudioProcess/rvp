import {Component} from '@angular/core'

@Component({
  selector: 'rv-logo',
  template: `
    <div class="logo">
      <img src="/assets/img/rv-logo_1000px.png" width="40px" alt="Research Video Logo" title="Research Video">
    </div>
  `,
  styles: [`
    .logo {
      font-size: 15px;
      font-weight: 500;
    }
  `]
})
export class LogoComponent {}
