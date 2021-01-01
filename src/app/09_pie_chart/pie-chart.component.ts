import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import {DataService} from '../shared/service';


@Component({
    selector: 'app-pie-chart-2',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.css']
})
export class PieChart2Component implements OnInit {

    title = 'Channels Depiction';

    private margin = {top: 20, right: 20, bottom: 30, left: 50};
    private width: number;
    private height: number;
    private radius: number;

    private arc: any;
    private labelArc: any;
    private pie: any;
    private color: any;
    private svg: any;
    private data: object[] = [];
    private devdata: any;
    message = '';

    constructor(private dataService: DataService) {
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.radius = Math.min(this.width, this.height) / 2;
    }


    ngOnInit() {
        this.devdata = this.dataService.getCachedData();
        this.prepareData();
        if (this.data.length > 0) {
            this.initSvg();
            this.drawPie();
        } else {
            this.message = this.dataService.noDataMessage;
        }

    }

    private prepareData() {
        // console.log('prepareData');
        const obj = {};
       this.devdata.forEach(el => {
            const channelName = el.channelName;
            obj[channelName] = obj[channelName] || 0;
            obj[channelName]++;
        });

        Object.keys(obj).forEach((k) => {
            this.data.push({cnt: 1 * obj[k], channelName: k});
        });

        this.data.sort(function (a, b) {
            return a['cnt'] - b['cnt'];
        });

        console.log(this.data);
    }
    private initSvg() {
        this.color = d3Scale.scaleOrdinal()
            .range(d3ScaleChromatic.schemeCategory10);
        this.arc = d3Shape.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(0);
        this.labelArc = d3Shape.arc()
            .outerRadius(this.radius - 40)
            .innerRadius(this.radius - 40);
        this.pie = d3Shape.pie()
            .sort(null)
            .value((d: any) => d.cnt);
        this.svg = d3.select('svg')
            .append('g')
            .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
    }

    private drawPie() {
        let g = this.svg.selectAll('.arc')
            .data(this.pie(this.data))
            .enter().append('g')
            .attr('class', 'arc');
        g.append('path').attr('d', this.arc)
            .style('fill', (d: any) => this.color(d.data.channelName) );
        g.append('text')
            .attr('transform', (d: any) => 'translate(' + this.labelArc.centroid(d) + ')')
            .attr('dx', '.35em')
            .style('fill', '#000')
            .text((d: any) => d.data.channelName + ' (' + d.data.cnt + ')');
    }

}
