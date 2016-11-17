import { Component, ElementRef, HostListener,
         Directive, Pipe} from 'angular2/core';
import { CommonModule, ORM_PROVIDERS, FORM_DIRECTIVES } from 'angular2/common';
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
        if (!this.element.classList.contains('show')) {
            return;
        }
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

    onShow(event) {
        // starting point elemevnt with id = base-... OR parrent element
        let base_element = document.querySelector(`#base-${this.id}`);
        let left = 0;
        if (!base_element) {
            base_element = this.parentElement;
        } else {
            left = base_element.offsetLeft;
        }
        if (!this.classList.contains('left') && !this.classList.contains('right')) {
            left = left + base_element.offsetWidth/2 - this.clientWidth/2;
        } else if (this.classList.contains('right')) {
            left = left + base_element.offsetWidth - this.offsetWidth;
        }
        this.style.left = left;
    }

    static get parameters() {
        return [[ElementRef]];
    }
  
    constructor(element) {
        this.element = element.nativeElement;
        this.count_click = 0;
        this.element.onshow = this.onShow;
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
    pure: false
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
    pure: false
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
    selector: 'tags',
    templateUrl: 'templates/tags-edit.html',
    directives: [Popover],
    inputs: ['tags', 'all_tags','all_tags_statistic', 'parrent_component' ],
    pipes: [NotInPipe, StartsWithPipe]
})
export class AdminTagsEdit {
    all_tags = [];
    tag_input = '';
    isAlphabetically = false;
    
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
        if (this.available().length == 0 && !this.tag_input) {
            return;
        }
        this.changePopover(event, 'show');
        this.current_i=0;
    }

    pushTag(tag) {
        if (!tag) {
            return;
        }
        let out = [];

        let tags = tag.split(',');
        this.tooltipError = false;
        
        tags.forEach((tag)=> {
            let t = tag.trim();
            if (!t) {
                return;
            }
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
            let t = '';
            if (this.current_i < 0) {
                t = this.tag_input;
            } else {
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
            if (this.available().length == 0) {
                this.changePopover(event, 'hide');
            }
            return;
        }
        if (['Enter', 'NumpadEnter'].includes(event.code)) {
            let t = ''
            if (this.current_i < 0) {
                t = this.tag_input;
            } else {
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
        if (this.available().length == 0) {
            this.changePopover(event, 'hide');
        }
        this.parrent_component.formChange = true;
    }

    sortAllTags(index) {
        let tags = this.all_tags_statistic.sort((a,b)=>{
            let _a = a[index];
            let _b = b[index];
            if (_a == _b) {
                return 0;
            }
            if (_a < _b ) {
                return -1;
            }
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
    selector: 'leave-page',
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
    selector: 'reach-text-editor',
    templateUrl: 'templates/reach-text-editor.html',
    directives: [Autosize, Popover],
    inputs: ['parrent_component']
})
export class RichTextEditor {
    showHtml = false;
    textBackground = true;
    formats = [
        {title: 'Paragraph', tag: 'p'},
        {title: 'Heading 1', tag: 'h1'},
        {title: 'Heading 2', tag: 'h2'},
        {title: 'Heading 3', tag: 'h3'},
        {title: 'Heading 4', tag: 'h4'},
        {title: 'Heading 5', tag: 'h5'},
        {title: 'Heading 6', tag: 'h6'},
        {title: 'Blockquote ', tag: 'blockquote'}
    ];
    
    palette = [
    [
        {color: 'rgb(0, 0, 0)', title: 'Color Black'},
        {color: 'rgb(68, 68, 68)', title: 'Color Charcoal, hue Grey'},
        {color: 'rgb(102, 102, 102)', title: 'Color Dim Gray, hue Grey'},
        {color: 'rgb(153, 153, 153)', title: 'Color Nobel, hue Grey'},
        {color: 'rgb(204, 204, 204)', title: 'Color Very Light Grey, hue Grey'},
        {color: 'rgb(238, 238, 238)', title: 'Color White Smoke, hue White'},
        {color: 'rgb(243, 243, 243)', title: 'Color White Smoke Light, hue White'},
        {color: 'rgb(255, 255, 255)', title: 'Color White'},
    ],
    [
        {color: 'rgb(255, 0, 0)', title: 'Color Red'},
        {color: 'rgb(255, 153, 0)', title: 'Color Orange Peel, hue Orange'},
        {color: 'rgb(255, 255, 0)', title: 'Color Yellow'},
        {color: 'rgb(0, 255, 0)', title: 'Color Lime, hue Green'},
        {color: 'rgb(0, 255, 255)', title: 'Color Aqua, hue Blue'},
        {color: 'rgb(0, 0, 255)', title: 'Color Blue'},
        {color: 'rgb(153, 0, 255)', title: 'Color Electric Purple, hue Violet'},
        {color: 'rgb(255, 0, 255)', title: 'Color Magenta, hue Violet'},
    ],
    [
        {color: 'rgb(244, 204, 204)', title: 'Color Coral Candy, hue Red'},
        {color: 'rgb(252, 229, 205)', title: 'Color Serenade, hue Orange'},
        {color: 'rgb(255, 242, 204)', title: 'Color Blanched Almond, hue Brown'},
        {color: 'rgb(217, 234, 211)', title: 'Color Peppermint, hue Green'},
        {color: 'rgb(208, 224, 227)', title: 'Color Iceberg, hue Green'},
        {color: 'rgb(207, 226, 243)', title: 'Color Onahau, hue Blue'},
        {color: 'rgb(217, 210, 233)', title: 'Color Blue Chalk, hue Violet'},
        {color: 'rgb(234, 209, 220)', title: 'Color Vanilla Ice, hue Red'},
        {color: 'rgb(234, 153, 153)', title: 'Color Tonys Pink, hue Orange'},
        {color: 'rgb(249, 203, 156)', title: 'Color Apricot, hue Orange'},
        {color: 'rgb(255, 229, 153)', title: 'Color Cream Brulee, hue Yellow'},
        {color: 'rgb(182, 215, 168)', title: 'Color Moss Green, hue Green'},
        {color: 'rgb(162, 196, 201)', title: 'Color Shadow Green, hue Green'},
        {color: 'rgb(159, 197, 232)', title: 'Color Sail, hue Blue'},
        {color: 'rgb(180, 167, 214)', title: 'Color Biloba Flower, hue Violet'},
        {color: 'rgb(213, 166, 189)', title: 'Color Melanie, hue Red'},
        {color: 'rgb(224, 102, 102)', title: 'Color Froly, hue Red'},
        {color: 'rgb(246, 178, 107)', title: 'Color Tacao, hue Orange'},
        {color: 'rgb(255, 217, 102)', title: 'Color Dandelion, hue Yellow'},
        {color: 'rgb(147, 196, 125)', title: 'Color Olivine, hue Orange'},
        {color: 'rgb(118, 165, 175)', title: 'Color Neptune, hue Green'},
        {color: 'rgb(111, 168, 220)', title: 'Color Jordy Blue, hue Blue'},
        {color: 'rgb(142, 124, 195)', title: 'Color Moody Blue, hue Violet'},
        {color: 'rgb(194, 123, 160)', title: 'Color Puce, hue Red'},
        {color: 'rgb(204, 0, 0)', title: 'Color Free Speech Red, hue Red'},
        {color: 'rgb(230, 145, 56)', title: 'Color California, hue Orange'},
        {color: 'rgb(241, 194, 50)', title: 'Color Saffron, hue Yellow'},
        {color: 'rgb(106, 168, 79)', title: 'Color Apple, hue Green'},
        {color: 'rgb(69, 129, 142)', title: 'Color Jelly Bean, hue Blue'},
        {color: 'rgb(61, 133, 198)', title: 'Color Curious Blue, hue Blue'},
        {color: 'rgb(103, 78, 167)', title: 'Color Studio, hue Violet'},
        {color: 'rgb(166, 77, 121)', title: 'Color Royal Heath, hue Red'},
        {color: 'rgb(153, 0, 0)', title: 'Color Sangria, hue Red'},
        {color: 'rgb(180, 95, 6)', title: 'Color Tawny, hue Orange'},
        {color: 'rgb(191, 144, 0)', title: 'Color Dark Goldenrod, hue Yellow'},
        {color: 'rgb(56, 118, 29)', title: 'Color Bilbao, hue Green'},
        {color: 'rgb(19, 79, 92)', title: 'Color Blue Stone, hue Green'},
        {color: 'rgb(11, 83, 148)', title: 'Color Dark Cerulean, hue Blue'},
        {color: 'rgb(53, 28, 117)', title: 'Color Midnight Blue, hue Blue'},
        {color: 'rgb(116, 27, 71)', title: 'Color Pompadour, hue Violet'},
        {color: 'rgb(102, 0, 0)', title: 'Color Maroon, hue Brown'},
        {color: 'rgb(120, 63, 4)', title: 'Color Saddle Brown, hue Brown'},
        {color: 'rgb(127, 96, 0)', title: 'Color Olive, hue Green'},
        {color: 'rgb(39, 78, 19)', title: 'Color Verdun Green, hue Green'},
        {color: 'rgb(12, 52, 61)', title: 'Color Cyprus, hue Green'},
        {color: 'rgb(7, 55, 99)', title: 'Color Sapphire, hue Blue'},
        {color: 'rgb(32, 18, 77)', title: 'Color Midnight Blue, hue Blue'},
        {color: 'rgb(76, 17, 48)', title: 'Color Pohutukawa, hue Red'},
    ]]

    alignments = [
        {title: 'Align left', command: 'justifyLeft'},
        {title: 'Align center', command: 'justifyCenter'},
        {title: 'Align right', command: 'justifyRight'},
    ];

    tables1 = [
        {title: 'Insert row above', command1: 'addTableCells', command2: 'above'},
        {title: 'Insert row below', command1: 'addTableCells', command2: 'below'},
        {title: 'Insert column before', command1: 'addTableCells', command2: 'before'},
        {title: 'Insert column after', command1: 'addTableCells', command2: 'after'},
    ]

    tables2 = [
        {title: 'Delete row', command1: 'deleteTableCells', command2: 'row'},
        {title: 'Delete column', command1: 'deleteTableCells', command2: 'column'},
        {title: 'Delete table', command1: '', command2: ''},
    ]


    ngOnInit() {
        this.editor = new wysihtml5.Editor('editor', {
            toolbar: 'toolbar',
            parserRules: wysihtml5ParserRules,
            stylesheets: ['/static/admin/wysihtml/css/wysihtml5.css']
        });
        this.popover_formatting = document.querySelector('#formatting-popover');
        this.popover_alignment = document.querySelector('#alignment-popover');
        this.popover_color = document.querySelector('#color-popover');
        this.popover_table = document.querySelector('#table-popover');
        this.popovers = [
            this.popover_formatting, this.popover_alignment,
            this.popover_color, this.popover_table
        ]

        let self = this;
        this.editor.currentView.sandbox.getDocument().addEventListener("click", () => {
            self.hidePopovers()
        });
    }

    onPopover(event, popover){
        event.preventDefault();
        event.stopPropagation();
        this.hidePopovers(popover);
        this.switchPopover(popover);
    }

    hidePopover(popover) {
        if (popover.classList.contains('show')) {
            popover.classList.remove('show');
            popover.classList.add('hide');
        }
    }
    hidePopovers(exclude) {
        for (let i in this.popovers) {
            if (this.popovers[i] != exclude) {
                this.hidePopover(this.popovers[i]);
            }
        }
    }
    switchPopover(popover, event) {
        let show = popover.classList.contains('hide');
        popover.classList.remove(show ? 'hide' : 'show');
        popover.classList.add(show ? 'show' : 'hide');
        if (show) {
            let event = new Event('show');
            popover.dispatchEvent(event);
        }
    }
    switchTextBackground(event) {
        event.preventDefault();
        event.stopPropagation();
        this.textBackground=!this.textBackground
    }
    hideView(){
        this.showHtml = !this.showHtml;
    }

    commandColor(color) {
        if (this.textBackground) {
            this.editor.composer.commands.exec('foreColorStyle', color);
        } else {
            this.editor.composer.commands.exec('bgColorStyle', color);
        }
        this.hidePopovers();
        this.editor.focus();
    }

    commandFormatBlock(tag) {
        this.editor.composer.commands.exec('formatBlock', tag);
        this.hidePopovers();
        this.editor.focus();
    }
    commandTag(tag) {
        this.editor.composer.commands.exec(tag);
        this.editor.focus();
    }
    createTable() {
        this.editor.composer.commands.exec('createTable', { rows: 1, cols: 1 });
        this.hidePopovers();
        this.editor.focus();
    }
    commandTable(command1, command2) {
        this.editor.composer.commands.exec(command1, command2);
        this.hidePopovers();
        this.editor.focus();
    }

}

