import {Component} from '@angular/core'

@Component({
  selector: 'rv-logo',
  template: `
    <div class="logo">
      <img src="/assets/img/rv-logo_1000px.png" alt="Research Video Logo" title="Research Video">
    </div>
  `,
  styles: [`
    .logo {
      padding: 5px;
      display: inline-block;
      font-size: 15px;
      font-weight: 500;
    }

    img {
      width: 25px;
    }
  `]
})
export class LogoComponent {}
