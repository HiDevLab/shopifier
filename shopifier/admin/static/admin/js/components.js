import { NgModule, Component, ElementRef, HostListener, Directive, Pipe, Input,
    Output, EventEmitter } from '@angular/core';
import { CommonModule, ORM_PROVIDERS, FORM_DIRECTIVES } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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


//------------------------------------------------------------------------------Autosize
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


//------------------------------------------------------------------------------Popover
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


//------------------------------------------------------------------------------booleanPipe
@Pipe({
    name: 'boolean',
    pure: false
})
export class booleanPipe {
    transform(array, parameter, val) {
    return array.filter( (value) => {
        return !!value[parameter] == val;
    });
  }
}


//------------------------------------------------------------------------------ArrayLengthPipe
@Pipe({
    name: 'length',
    pure: false
})
export class ArrayLengthPipe {
    transform(array, max) {
    return array.filter( value => {
        return array.indexOf(value) < max;
    });
  }
}

//------------------------------------------------------------------------------NotInPipe
@Pipe({
    name: 'not_in',
    pure: false,
})
export class NotInPipe {
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


//------------------------------------------------------------------------------StartsWithPipe
@Pipe({
    name: 'startswith',
    pure: false
})
export class StartsWithPipe {
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


//------------------------------------------------------------------------------PropertyStartsWithPipe
@Pipe({
    name: 'property_startswith',
    pure: false
})
export class PropertyStartsWithPipe {
    transform(list, property, filter) {
        if (!list) {
            return [];
        }
        if (!filter) {
            return list;
        }
        return list.filter( value => {
            return value[property].startsWith(filter);
        });
    }
}



//------------------------------------------------------------------------------AdminTagsEdit
@Component({
    selector: 'tags',
    templateUrl: 'templates/tags-edit.html',
    directives: [Popover],
    interpolation: ['[[', ']]'],
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
        this.current_i = 0;
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


//------------------------------------------------------------------------------AdminLeavePage
@Component({
    selector: 'leave-page',
    templateUrl: 'templates/leave-page.html',
    interpolation: ['[[', ']]'],
//     inputs: ['parrent_component']
})
export class AdminLeavePage {
    @Input() parrent_component = null;
    onClick(parrent_component, val) {
        parrent_component.unloadPage(val);
        parrent_component.showLeavePageDialog = false;
        parrent_component._admin.notNavigate = !val;
    }
}


//------------------------------------------------------------------------------RichTextEditor
@Component({
    selector: 'reach-text-editor',
    templateUrl: 'templates/reach-text-editor.html',
    interpolation: ['[[', ']]'],
    directives: [Autosize, Popover],
    inputs: ['parent', 'change']
})
export class RichTextEditor {
    showHtml = false;
    textBackground = true;
    tableTools = false;

    showLinkEdit = false;
    linkTo = '';
    openlinkIn = 'the same window';
    linkTitle = '';
    isLink = false;
    linkToolTitle = 'Insert link';
    
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
        {title: 'Delete table', command1: 'deleteTable', command2: ''},
    ]


    ngOnInit() {
        this.parent.rich_text_editor = this;
        this.editor = new wysihtml5.Editor('editor', {
            parserRules: wysihtml5ParserRules,
            stylesheets: ['/static/admin/wysihtml/css/wysihtml5.css']
        });
        this.editor.on("load", this.onLoad.bind(this));
    }

    onLoad(){
        let self = this;
        this.document = this.editor.currentView.sandbox.getDocument();
        this.document.body.blur();
        wysihtml5.dom.delegate(this.document.body, 'a', 'click', (event) => {
            let el = event.target;
            self.linkTo = el.href;
            self.linkTitle = el.title;
            if (el.target === '_blank') {
                self.openlinkIn = 'a new window';
            } else {
                self.openlinkIn = 'the same window';
            }
            self.showLinkEdit = true;
        });
        this.editor.on('interaction:composer', () => {
            let selection = self.editor.composer.selection.getSelection();
            let el = selection.focusNode.parentElement;
            if (el.nodeName === 'A') {
                self.linkTo = el.href;
                self.linkTitle = el.title;
                if (el.target === '_blank') {
                    self.openlinkIn = 'a new window';
                } else {
                    self.openlinkIn = 'the same window';
                }
                self.isLink = true;
                self.linkToolTitle = 'Update link';
            } else {
                self.linkTo = '';
                self.linkTitle = '';
                self.openlinkIn = 'the same window';
                self.isLink = false;
                self.linkToolTitle = 'Insert link';
            }
        });

        this.editor.on('interaction', this.onChange.bind(this));

        this.popover_formatting = document.querySelector('#formatting-popover');
        this.popover_alignment = document.querySelector('#alignment-popover');
        this.popover_color = document.querySelector('#color-popover');
        this.popover_table = document.querySelector('#table-popover');
        this.popovers = [
            this.popover_formatting, this.popover_alignment,
            this.popover_color, this.popover_table
        ]

        this.document.addEventListener('click', () => {
            self.hidePopovers()
        });
        
        this.editor.on('tableselect:composer', () => {
            self.tableTools = true;
        });
        this.editor.on('tableunselect:composer', () => {
            self.tableTools = false;
        });
//         this.editor.on('change', () => {
//             self.parent.body_html = self.editor.getValue();
//             self.parent._admin.notNavigate = true;
//             self.parent.formChange = true;
//             console.log('change');
//         });

        //disable drop files in iframe
        this.document.addEventListener('dragenter', this.disableDrop, false);
        this.document.addEventListener('dragover', this.disableDrop, false);
        this.document.addEventListener('drop', this.disableDrop, false);
    }

    ngOnDestroy() {
        this.document.removeEventListener('dragenter', this.disableDrop, false);
        this.document.removeEventListener('dragover', this.disableDrop, false);
        this.document.removeEventListener('drop', this.disableDrop, false);
        this.editor.destroy();
        this.parent.rich_text_editor = undefined;
    }

    onChange() {
        this.parent.body_html = this.editor.getValue();
        this.parent[this.change]();
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
        if (this.editor.currentView === this.editor.textarea || this.editor.currentView === "source") {
            this.editor.fire("change_view", "composer");
        } else {
            this.editor.fire("change_view", "textarea");
        }
        this.hidePopovers();
        this.editor.focus();
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
        this.editor.composer.commands.exec('createTable', { rows: 1, cols: 1, tableStyle: "width: 100%;" });
        this.hidePopovers();
        this.editor.focus();
    }
    commandTable2(event, command1, command2) {
        if (command1 ==='deleteTable') {
            let table = this.editor.composer.tableSelection.table;
            let selCell = wysihtml5.dom.table.findCell(table, {'row': 0, 'col': 0});
            while(table && selCell) {
                this.editor.composer.tableSelection.select(selCell, selCell)
                this.editor.composer.commands.exec('deleteTableCells', 'row');
                selCell = wysihtml5.dom.table.findCell(table, {'row': 0, 'col': 0});
            }
        } else {
            this.commandTable(event, command1, command2);
        }
        this.tableTools = false;
    }
    commandTable(event, command1, command2) {
        if (!this.editor.composer.tableSelection.table) {
            return;
        }
        this.editor.composer.commands.exec(command1, command2);
        this.hidePopovers();
        this.editor.focus();
    }
    insertLink() {
        this.showLinkEdit = false;

        if (this.openlinkIn==='the same window') {
            this.editor.composer.commands.exec('createLink', { href: this.linkTo, target: '', title: this.linkTitle, toggle: true});
        } else {
            this.editor.composer.commands.exec('createLink', { href: this.linkTo, target: '_blank', title: this.linkTitle, toggle: true});
        }
        this.editor.focus();
    }
    removeLink() {
        this.showLinkEdit = false;
        this.editor.composer.commands.exec('removeLink');
        this.editor.focus();
    }

    clearFormatting() {
        this.editor.composer.commands.exec('removeFormat');
        this.editor.focus();
    }

    disableDrop(evt) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = "none";
        evt.dataTransfer.dropEffect = "none";
    }
}


//------------------------------------------------------------------------------Calendar
@Component({
    selector: 'calendar',
    templateUrl: 'templates/calendar.html',
    interpolation: ['[[', ']]'],
    inputs: ['parent', 'show', 'change', 'start_date']
})
export class Calendar {
    week = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    days = [];
    months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    static get parameters() {
        return [[ElementRef]];
    }
  
    constructor(element) {
        this.element = element.nativeElement;
    }

    ngOnInit() {
        if (!this.start_date) {
            this.start_date = new Date(1900, 0, 1);
        }

        this.base_element = document.querySelector(`#base-${this.element.id}`) ||
            this.element.parentElement;
        let rect = this.base_element.getBoundingClientRect();
        if (rect.top < 350) {
            this.element.style.top = this.base_element.offsetHeight;
        } else {
            this.element.style.bottom = this.base_element.offsetHeight;
        }
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
        this.day = this.date.getDate();
        this.refresh();
    }

    disableDay(day) {
        if (this.present) {
            return day < this.start_date.getDate();
        } else {
            return false;
        }

    }

    refresh() {
        this.days = [];
        let days = new Date(this.year, this.month + 1, 0).getDate();
        let start = new Date(this.year, this.month, 1).getDay();
        let max = ((start + days) > 35) ? 42 : 35;

        this.present = this.start_date.getFullYear() === this.year &&
                this.start_date.getMonth() === this.month;

        for (let i=0; i < max; i++) {
            this.days.push({day: null, enable: 0});
        }
        for (let i=0; i < days; i++) {
            if (!this.disableDay(i + 1)) {
                this.days[i + start].enable = 1;
            }
            this.days[i + start].day = i + 1;
        }
    }

    onPrev() {
        this.month--;
        if (this.month < 0) {
            this.month = 11;
            this.year--;
        }
        this.refresh();
    }

    onNext() {
        this.month++;
        if (this.month > 11) {
            this.month = 0;
            this.year++;
        }
        this.refresh();
    }

    onSelect(day) {
        if (day.enable && day.day) {
            let d = new Date(this.year, this.month, day.day, 7);
            this.parent[this.change](d);
            this.parent[this.show] = false;
        }
    }

    @HostListener('window:click',['$event'])
    onClick(event) {
        let obj = event.target;
        if (this.base_element!=obj && !this.childOf(obj, this.element)) {
            this.parent[this.show] = false;
        }
        else {
            event.stopPropagation();
        }
    }

    childOf(c, p) {
        while(c !== p && c) {
            c = c.parentNode;
        }
        return c === p;
    }
}


//------------------------------------------------------------------------------Wait
@Component({
    selector: 'wait',
    template: '<i *ngIf="!wait" class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>',
    inputs: ['wait']
})
export class Wait {}


//------------------------------------------------------------------------------PopUpMenu
export class PopUpMenuCollection {
    _menus = new Set;

    getElement(id) {
        this._menus.add(id);
        let el = document.querySelector(`[id='${id}']`);
        return el;
    }

    onSwitch(event, id) {
        event.preventDefault();
        event.stopPropagation();
        this.hideAllMenu(id);
        return this.switchMenu(id);
    }

    hide(id) {
        let el = this.getElement(id);
        if (el) {
            el.component.onHide();
        }
    }

    show(id) {
        let el = this.getElement(id);
        if (el) {
            el.component.onShow();
        }
        this.hideAllMenu(id)
    }

    hideAllMenu(exclude) {
        this._menus.forEach( menu => {
            if (menu != exclude) {
                this.hide(menu);
            }
        });
    }

    switchMenu(id) {
        let show = false;
        let el = this.getElement(id);
        if (el) {
            show = el.component.onSwitch();
        }
        return show;
    }
}


@Component({
    selector: 'pop-up-menu',
    template: 
    `
        <div class="pop-up-menu">
           <ul class="max-vh5">
                <wait [wait]="items.length"></wait>
                <li *ngFor="let item of items;let i=index;"
                        (click)="selectItem($event, item)"
                        (mouseover)="onOver($event, i)"
                        [ngClass]="{selected: item.select, hover:i==current_i, disabled:item.disabled}">
                    <i class="fa fa-check" [ngClass]="{hidden: !item.select}"></i>
                    <span class="ml10" (click)="selectItem($event, item)">[[ item.title ]]</span>
                </li>
            </ul>
        </div>
    `,
    interpolation: ['[[', ']]'],
    inputs: ['items'],
})
export class PopUpMenu {
    stopOver = false;
    show = false;

    @Output() select = new EventEmitter();

    static get parameters() {
        return [[ElementRef]];
    }

    constructor(element) {
        this.element = element.nativeElement;
    }
    ngOnInit() {
        this.element.show = false;
        this.element.component = this;
//         document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }


    @HostListener('window:click',['$event'])
    onClick(event) {
        if (!this.show) {
            return;
        }
        let obj = event.target;
        if (this.element.previousElementSibling!=obj && !this.childOf(obj, this.element)) {
            this.onHide();
        }
        else {
            event.stopPropagation();
        }
    }

    onSwitch() {
        if (this.show) {
            this.onHide()
        } else {
            this.onShow()
        }
    }

    onShow(event) {
        // starting point elemevnt with id = base-... OR parrent element
        if (this.show) {
            return;
        }
        let base_element = document.querySelector(`#base-${this.id}`);
        let left = 0;
        if (!base_element) {
            base_element = this.element.parentElement;
        } else {
            left = base_element.offsetLeft;
        }
        if (!this.element.classList.contains('left') && !this.element.classList.contains('right')) {
            left = left + base_element.offsetWidth/2 - this.element.clientWidth/2;
        } else if (this.element.classList.contains('right')) {
            left = left + base_element.offsetWidth - this.element.offsetWidth;
        }
        this.element.style.left = left;
        this.element.classList.remove('hide');
        this.element.classList.add('show');
        this.show = true;
        this.current_i = 0;
    }

    onHide(event) {
        if (!this.show) {
            return;
        }
        this.element.classList.remove('show');
        this.element.classList.add('hide');
        this.show = false;
    }

    @HostListener('window:keyup',['$event'])
    onKeyUp(event) {
        if (!this.show) {
            return;
        }
        let li = this.element.querySelectorAll('li');
        if( this.current_i > (this.items.length-1)) {
            this.current_i = this.items.length - 1;
        }

        if (event.code=='ArrowDown' && this.current_i < (this.items.length-1)) {
            this.current_i++;
            this.pauseOver()
            li[this.current_i].scrollIntoView(false);
            event.stopImmediatePropagation();
            return;
        } else if (event.code=='ArrowUp' && this.current_i > 0) {
            this.current_i--;
            this.pauseOver()
            li[this.current_i].scrollIntoView(false);
            event.stopImmediatePropagation();;
            return;
        } else if (['Enter', 'NumpadEnter'].includes(event.code)) {
            event.stopImmediatePropagation();
            this.select.emit(this.items[this.current_i]);
        } else if (event.code=='Escape') {
            this.onHide();
        }
    }

    onOver(event, i) {
        if (!this.show) {
            return;
        }
        if (!this.stopOver) {
            this.current_i = i;
        }
    }

    childOf(c, p) {
        while(c !== p && c) {
            c = c.parentNode;
        }
        return c === p;
    }

    pauseOver() {
        this.stopOver = true;
        setTimeout( () => {
            this.stopOver = false;
        }, 500, this);
    }

    selectItem(event, item) {
        event.stopPropagation();
        this.select.emit(item);
    }
}


//------------------------------------------------------------------------------AdminComponentsModule
@NgModule({
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule
    ],
    declarations: [
        AdminLeavePage,
        Autosize,
        Popover,
        AdminTagsEdit,
        AdminLeavePage,
        RichTextEditor,
        Calendar,
        PopUpMenu,
        Wait,
        StartsWithPipe,
        ArrayLengthPipe,
        NotInPipe,
        booleanPipe,
        PropertyStartsWithPipe,
        
    ],
    exports: [
        AdminLeavePage,
        Autosize,
        Popover,
        booleanPipe,
        ArrayLengthPipe,
        NotInPipe,
        PropertyStartsWithPipe,
        AdminTagsEdit,
        StartsWithPipe,
        AdminLeavePage,
        RichTextEditor,
        Calendar,
        Wait,
        PopUpMenu
    ]
})
export class AdminComponentsModule {}
