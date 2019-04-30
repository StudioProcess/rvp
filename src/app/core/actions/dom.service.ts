import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    ApplicationRef,
    EmbeddedViewRef,
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DomService {

  constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private appRef: ApplicationRef,
      private injector: Injector
  ) { }

  instantiateComponent(component: any) {
    // Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector)
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView)

    return componentRef
  }

  attachComponent(componentRef: any, attachTo: HTMLElement) {
    // Get DOM element from component
    let domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    //console.log(domElem)
    // Append DOM element
    return attachTo.appendChild(domElem);
  }

  /*attachNodeToSelection(componentRef: any) {

    let domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    let range = document.getSelection()!.getRangeAt(0)!
    if(!range.collapsed) {
      range.deleteContents()
    }
    range.insertNode(domElem)

    let sel = document.getSelection()
    range.setStartBefore(domElem.childNodes[0])
    range.setEndAfter(domElem.childNodes[0])
    sel!.removeAllRanges()
    sel!.addRange(range)
  }*/

  destroyComponent(componentRef: any) {
    // remove component from the component tree and from the DOM
    this.appRef.detachView(componentRef.hostView);
    return componentRef.destroy();
  }

  getInstance(componentRef: any) {
    return ('instance' in componentRef) ? componentRef.instance : null
  }
}
