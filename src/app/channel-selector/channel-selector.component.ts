import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Channel, channels} from '../shared/channel';


@Component({
    selector: 'app-channel-selector',
    templateUrl: './channel-selector.component.html',
    styleUrls: ['./channel-selector.component.css']
})
export class ChannelSelectorComponent implements OnInit {

    @Input() channel: Channel;
    @Output() valueChange = new EventEmitter<Channel>();

    channels  = channels;

    constructor() {}

    public clicked(selchannel) {
         this.valueChange.emit(selchannel);
    }

    ngOnInit() {}

}
