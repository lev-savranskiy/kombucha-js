import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import {DataService} from '../shared/service';


@Component({
    selector: 'app-donut-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.css']
})
export class DonutChartComponent implements OnInit {

    title = 'Environments Depiction';

    private width: number;
    private height: number;

    private svg: any;     // TODO replace all `any` by the right type

    private radius: number;

    private arc: any;
    private pie: any;
    private color: any;
    message = '';
    private g: any;
    private data: object[] = [];
    private devdata: any;
    constructor(private dataService: DataService) {}


    ngOnInit() {
        this.devdata = this.dataService.getCachedData();
        this.prepareData();
        if (this.data.length > 0) {
            this.initSvg();
            this.drawChart(this.data);
        } else {
            this.message = this.dataService.noDataMessage;
        }
    }

    private prepareData() {
        // console.log('prepareData');
        const obj = {};
        this.devdata.forEach(el => {
            const env = el.env.toUpperCase();
            obj[env] = obj[env] || 0;
            obj[env]++;
        });

        Object.keys(obj).forEach((k) => {
            this.data.push({cnt: 1 * obj[k], env: k});
        });

        this.data.sort(function (a, b) {
            return a['cnt'] - b['cnt'];
        });

        console.log(this.data);
    }
    private initSvg() {
        this.svg = d3.select('svg');

        this.width = +this.svg.attr('width');
        this.height = +this.svg.attr('height');
        this.radius = Math.min(this.width, this.height) / 2;

        this.color = d3Scale.scaleOrdinal()
            .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

        this.arc = d3Shape.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(this.radius - 70);

        this.pie = d3Shape.pie()
            .sort(null)
            .value((d: any) => d.cnt);

        this.svg = d3.select('svg')
            .append('g')
            .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
    }

    private drawChart(data: any[]) {
        let g = this.svg.selectAll('.arc')
            .data(this.pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', this.arc)
            .style('fill', d => this.color(d.data.env));

        g.append('text')
            .attr('transform', d => 'translate(' + this.arc.centroid(d) + ')')
            .attr('dy', '.35em')
            .text(d => d.data.env + ' (' + d.data.cnt + ')');
    }

}
