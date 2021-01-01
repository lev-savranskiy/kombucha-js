import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {DataService} from '../shared/service';
import {USMAP} from '../shared/usmap';
import {Router} from '@angular/router';
import {PipeTransform, Pipe} from '@angular/core';
import {Channel} from '../shared/channel';

import * as d3 from 'd3';
import * as d3Hierarchy from 'd3-hierarchy';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Geo from 'd3-geo/src/index';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})


export class MapComponent implements OnInit {

    colorFn;
    channel: Channel;
    selectedChannel;
    title = 'Week 49: 12/10-12/16 sales map';
    message = '';
    usmap = USMAP;
    usmapArray = [];
    salesArray = [];
    salesGeoArray = [];
    storesArray = [];
    colorsMap = {};
    maxValue = 100;
    lat = 39.9509956;
    lng = -75.1644501;
    mode = 'svg';
    state = null;

    constructor(private dataService: DataService, private router: Router) {
        this.channel = new Channel();
        this.selectedChannel = this.channel.id;
        console.log('MapComponent constructor');
    }

    goToStore = el => {
        this.router.navigate(['/stacked-bar-chart/' + el]);
    };

    setMode = el => {
        if (el) {
            this.mode = 'agm';
            this.state = el.state;
        } else {
            this.mode = 'svg';
            this.state = null;
        }
    }

    generateMock(min, max) {
        return Math.random() * (max - min) + min;
    }

    updateChannel(selectedChannel): void {
        console.log('selectedChannel map');
        console.log(selectedChannel);
        this.channel = selectedChannel;
        this.selectedChannel = this.channel.id;
        this.ngOnInit();
    }

    ngOnInit() {

        let cnt = 0;
        console.log('MapComponent ngOnInit');
        this.storesArray = [
            {addr: '1429 Walnut Street Philadelphia, PA 19102', d: 37},
            {addr: '1351 South Columbus Blvd Philadelphia, PA 19147 ', d: 29},
            {addr: '4504B City Ave Philadelphia, PA 19131', d: 21},
            {addr: '130 Town Square Place King of Prussia, PA 19406', d: 14},
            {addr: '116 W Township Line Rd 500 Havertown, PA 19083', d: 8}

        ];

        this.usmapArray = [];
        this.salesArray = [];
        const  maxValues = {
            'AGGREGATE': 120,
            'TELESALES': 49,
            'RETAIL': 71,
        };
        this.maxValue =  maxValues[this.selectedChannel];
        this.salesGeoArray = [{lat: this.lat, lng: this.lng, d: 2000}];
        this.colorFn = d3.scaleSequential(d3.interpolateBlues).domain([0, this.maxValue]);

        for (const k in this.usmap) {
            this.usmapArray.push({state: k, d: this.usmap[k]});
            let sale = Math.floor(this.generateMock(20, this.maxValue));

            if (k === 'PA') {
                sale = this.maxValue ;
            }


            this.salesGeoArray.push({
                lat: this.generateMock(39.9, 40.3),
                lng: -this.generateMock(75.2, 76.0),
                d: Math.floor(Math.random() * 1000)
            });

            this.salesArray.push({state: k, d: sale});
            this.colorsMap[k] = this.colorFn(sale);
            cnt++;
        }

        this.salesArray.sort(function (a, b) {
            return b.d - a.d;
        });
    }

}
