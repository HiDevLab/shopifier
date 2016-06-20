import { ElementRef, HostListener, Directive } from 'angular2/core';

//------------------------------------------------------------------------------
// Steve Papa
//------------------------------------------------------------------------------
/*
import {Component} from '@angular/core';
import {Autosize} from 'angular2-autosize';

@Component({
  template: `
    <textarea autosize class="my-textarea">Hello, this is an example of Autosize in Angular2.</textarea>
  `,
  directives: [Autosize]
})

class App {

}
*/

@Directive({
    selector: 'textarea[autosize]'
})
export class Autosize {
    @HostListener('input',['$event.target'])
    onInput(textArea) {
        this.adjust();
    }
  
    static get parameters() {
        return [[ElementRef]];
    }
  
    constructor(element) {
        this.element = element.nativeElement;
    }
  
    ngOnInit() {
        this.element.style.overflow = 'hidden';
        this.adjust();
    }
  
    adjust() {
        this.element.style.height = 'auto';
        this.element.style.height = this.element.scrollHeight + 'px';
    }
}


@Directive({
    selector: 'popover'
})
export class Popover {
    @HostListener('window:click',['$event'])
    onClick(event) {
        if (!this.element.classList.contains('show'))
            return;
        let obj = event.target;
        if(!this.childOf(obj, this.element)){
            this.element.classList.remove('show');
            this.element.classList.add('hide');
        }
        else
            event.stopPropagation();
    }

    static get parameters() {
        return [[ElementRef]];
    }
  
    constructor(element) {
        this.element = element.nativeElement;
        this.count_click = 0;
    }
  
    ngOnInit() {
        let s = window.getComputedStyle(this.element.parentElement);
        let left = `calc( 50% - (${s.width})/2 - ${s.paddingRight} - ${s.marginRight})`
        this.element.style.left = left;
    }
  
    childOf(c , p){
        while((c=c.parentNode)&&c!==p);return !!c
    }

}