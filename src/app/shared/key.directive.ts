import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: 'input, textarea'

})

export class KeyDirective {
    constructor() {
    }

    @HostListener('keydown', ['$event'])
    preventKey($event) {
      $event.stopPropagation();
    }
}
