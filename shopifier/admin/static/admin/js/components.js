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
        let s = window.getComputedStyle(this.element.parentElement);//parentElement);previousElementSibling
        let left = `calc( 50% - (${s.width})/2 - ${s.paddingRight} - ${s.marginRight})`;
        this.element.style.left = left;
    }
  
    childOf(c, p) {
        while(c !== p && c) {
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


//-----------------------------------------------------------------AdminTagsEdit
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
    isAlphabetically = false ;
    
    changePopover(event, display) {
        event.stopPropagation();
        let popover = document.querySelector('#tags-popover');
        if (!!popover) {
            popover.classList.remove(display=='show' ? 'hide' : 'show');
            popover.classList.add(display=='show' ? 'show' : 'hide');
        }
    }

    available() { //copy of NotInPipe and StratWithPipe
        if (!this.all_tags) {
            return [];
        }
        if (!this.tags) {
            return this.all_tags;
        }
        
        return this.all_tags.filter( value => {
            return  this.tags.indexOf(value) < 0 && 
                    (!this.tag_input || value.startsWith(this.tag_input));
        });
    }

    onInputFocus(event) {
        if (this.available().length == 0 && !this.tag_input)
            return;
        this.changePopover(event, 'show');
        this.current_i=0;
    }

    pushTag(tag) {
        if (!tag)
            return;

        let out = [];

        let tags = tag.split(',');
        this.tooltipError = false;
        
        tags.forEach((tag)=> {
            let t = tag.trim();
            if (!t) 
                return;
            if (this.tags.indexOf(t) > -1) {
                this.tooltipError = true;
                out.push(t);
                return;
            }
            this.tags.push(t);

        }, this);
        if (this.tooltipError) {
            let self = this;
            setTimeout(()=> { self.tooltipError = false; }, 5000);
        }
        return out.join(' ,');
        //Array.prototype.push.apply(this.tags, tags);
    }

    onKeyDown(event) {
        this.tooltipError = false; 
        if (['Comma'].includes(event.code)) {
            let t = ''
            if (this.current_i < 0) {
                t = this.tag_input;
            }
            else {
                t = this.available()[this.current_i];
            }
            this.tag_input = this.pushTag(t);

            this.parrent_component.formChange = true;
            this.current_i = 0;

            if (this.available().length == 0) {
                this.changePopover(event, 'hide');
            }
        }
    }

    onKeyUp(event) {
        this.tooltipError = false;
        let ul = document.querySelector('#tags-popover-ul');

        if (event.code=='ArrowDown' && (this.available().length-1) > this.current_i) {
            event.stopPropagation();
            this.current_i++;
            ul.children[this.current_i].scrollIntoView(false);
            return;
        }
        if (event.code=='ArrowUp' && (this.current_i > 0 || (!!this.tag_input && this.current_i > -1))) {
            this.current_i--;
            event.stopPropagation();
            ul.children[this.current_i].scrollIntoView(true);
            return;
        }
        if (event.code == 'Comma') {
            this.current_i = 0;
            this.tag_input = '';
            if (this.available().length == 0)
                this.changePopover(event, 'hide');
            return;
        }
        if (['Enter', 'NumpadEnter'].includes(event.code)) {
            let t = ''
            if (this.current_i < 0) {
                t = this.tag_input;
            }
            else {
                t = this.available()[this.current_i];
            }
            this.tag_input = this.pushTag(t);
            
            this.parrent_component.formChange = true;
            this.current_i = 0;

            if (this.available().length == 0) {
                this.changePopover(event, 'hide');
                return;
            }
        }
        
        if (!!this.tag_input) {
            if(this.available().length == 0 || this.available().length > 1) {
                this.current_i = -1;
                return;
            }
            if(this.available().length == 1 && this.available()[0]!=this.tag_input) {
                this.current_i = -1;
                return;
            }
            this.current_i = 0;
        }
    }

    deleteTag(i) {
        this.tags.splice(i, 1);
        this.parrent_component.formChange = true;
    }

    insertTag(event, tag) {
        this.tooltipError = false;
        event.stopPropagation();
        this.tag_input = this.pushTag(tag);
        if (this.available().length == 0)
            this.changePopover(event, 'hide');
        this.parrent_component.formChange = true;
    }

    sortAllTags(index) {
        let tags = this.all_tags_statistic.sort((a,b)=>{
            let _a = a[index];
            let _b = b[index];
            if (_a == _b)
                return 0;
            if (_a < _b )
                return -1;
            return 1;
        });

        this.all_tags = [];
        for (let i in tags) {
            this.all_tags.push(this.all_tags_statistic[i][0]);
        }
    }

    addTag(tag) {
        this.tag_input = this.pushTag(tag);
    }
}


//----------------------------------------------------------------AdminLeavePage
@Component({
    selector:   'leave-page',
    templateUrl: 'templates/leave-page.html',
    inputs: ['parrent_component']
})
export class AdminLeavePage {
    onClick(parrent_component, val) {
        parrent_component.unloadPage(val);
        parrent_component.showLeavePageDialog = false;
        parrent_component._admin.notNavigate = !val;
    }
}


//----------------------------------------------------------------RichTextEditor
@Component({
    selector:   'reach-text-editor',
    templateUrl: 'templates/reach-text-editor.html',
    inputs: ['parrent_component']
})
export class RichTextEditor {
    ngOnInit() {
        var editor = new wysihtml5.Editor("textarea", {
            toolbar:        "toolbar",
            useLineBreaks:  false
        });
 
    }
}
