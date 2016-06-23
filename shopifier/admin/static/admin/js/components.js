import { Component, ElementRef, HostListener,
         Directive, Pipe } from 'angular2/core';
import { ORM_PROVIDERS, FORM_DIRECTIVES } from 'angular2/common';
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
        //console.log(obj.parentNode.parentNode.parentNode);
//      if(!this.childOf(obj, this.element)){
        if (this.element.previousElementSibling!=obj && !this.childOf(obj, this.element)) {
             this.element.classList.remove('show');
             this.element.classList.add('hide');
        }
        else {
            event.stopPropagation();
        }
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
        let left = `calc( 50% - (${s.width})/2 - ${s.paddingRight} - ${s.marginRight})`;
        this.element.style.left = left;
    }
  
    childOf(c, p) {
        while(c !== p && c) {
            console.log(c);
            c = c.parentNode;
        }
        return c === p;
    }

}


@Pipe({
    name: 'length',
    pure: false,
})
export class ArrayLengthPipe{
    transform(array, max) {
    return array.filter( value => {
        return array.indexOf(value) < max;
    });
  }
}

@Pipe({
    name: 'not_in',
    pure: false,
})
export class NotInPipe{
    transform(all_tags, tags) {
        if (!all_tags) {
            return [];
        }
        if (!tags) {
            return all_tags;
        }
        return all_tags.filter( value => {
            return tags.indexOf(value) < 0;
        });
      }
}

@Pipe({
    name: 'stastartswith',
    pure: false,
})
export class StartsWithPipe{
    transform(tags, filter) {
        if (!tags) {
            return [];
        }
        if (!filter) {
            return tags;
        }
        return tags.filter( value => {
            return value.startsWith(filter);
        });
      }
}


//------------------------------------------------------------------------------------------------------------------------------------------------------------AdminTagsEdit

@Component({
    selector:   'tags',
    templateUrl: 'templates/tags-edit.html',
    directives: [Popover],
    inputs: ['tags', 'all_tags','all_tags_statistic', 'parrent_component' ],
    pipes: [NotInPipe, StartsWithPipe]
})
export class AdminTagsEdit {
    all_tags = [];
    tag_input = '';
     
    refresh(){
        this.available_tags = this.all_tags.filter( value => {
            return this.tags.indexOf(value) < 0;
        });
    }
    
    changePopover(event, display) {
        event.stopPropagation();
        let popover = document.querySelector('#tags-popover');
        if (popover) {
            popover.classList.remove(display=='show' ? 'hide' : 'show');
            popover.classList.add(display=='show' ? 'show' : 'hide');
        }
    }
    
    onInputFocus(event){
        this.changePopover(event, 'show');
        this.current_i=0;
    }
    
    available() { //copy of NotInPipe and StratWithPipe
        return this.all_tags.filter( value => {
            return this.tags.indexOf(value) < 0 && (!this.tag_input || value.startsWith(this.tag_input));
        });
    }
    
    onKeyDown(event) {
        if (event.code=='ArrowDown' && (this.available().length-1) > this.current_i) {
            this.current_i++;
        }
        
        if (event.code=='ArrowUp' && this.current_i>0) {
            this.current_i--;
        }
        
        if (['Enter', 'NumpadEnter'].includes(event.code)) {
            this.tags.push(this.available()[this.current_i]);
            this.parrent_component.formChange = true;
            this.current_i = 0;
            this.tag_input = '';
        }
    }
    
    deleteTag(i) {
        this.tags.splice(i, 1);
        this.parrent_component.formChange = true;
    }
    
    insertTag(event, tag) {
        event.stopPropagation();
        //let self = this;
//         setTimeout(function() {
//             self.tags.push(tag);
//         }, 0);
        this.tags.push(tag);
        this.parrent_component.formChange = true;
    }

}
