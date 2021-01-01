import {Component, ViewEncapsulation, OnInit} from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {DataService} from '../shared/service';



@Component({
    selector: 'app-bar-chart-2',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.css']
})
export class BarChart2Component implements OnInit {

    title = 'Average Duration by Agent';

    private width: number;
    private height: number;
    private margin = {top: 20, right: 20, bottom: 30, left: 40};

    private x: any;
    private y: any;
    private svg: any;
    private g: any;
    private data: object[] = [];
    private devdata: any;
    message = '';

    constructor(private dataService: DataService) {}


    ngOnInit() {
        this.devdata = this.dataService.getCachedData();
        this.prepareData();
        if (this.data.length > 0) {
            this.initSvg();
            this.initAxis();
            this.drawAxis();
            this.drawBars();
        } else {
            this.message = this.dataService.noDataMessage;
        }

    }

    private prepareData() {
        // console.log('prepareData');
        const obj = {};
       this.devdata.forEach(el => {
            const agentId = el.agentId;
            obj[agentId] = obj[agentId] || [];
            obj[agentId].push(el.duration / 1000 / 60);
        });

        Object.keys(obj).forEach((k) => {
            const arr = obj[k];
            const arrAvg = arr.reduce((a, b) => a + b, 0) / arr.length;
            this.data.push({avg: arrAvg , agentId: k});
        });

        this.data.sort(function (a, b) {
            return a['avg'] - b['avg'];
        });

        // console.log(this.tdata);
    }

    private initSvg() {
        this.svg = d3.select('svg');
        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    private initAxis() {
        this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
        this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
        this.x.domain(this.data.map((d) => d['agentId']));
        this.y.domain([0, d3Array.max(this.data, (d) => d['avg'])]);
    }

    private drawAxis() {
        this.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + (this.height) + ')')
            .call(d3Axis.axisBottom(this.x))
            .selectAll('text')
            .style('text-anchor', 'end')
            // .attr('dx', '-.8em')
            // .attr('dy', '.15em')
            .attr('transform', 'rotate(-15)');

        this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y).ticks(10, 's'))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .text('Minutes');
    }

    private drawBars() {
        this.g.selectAll('.bar')
            .data(this.data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => this.x(d.agentId) )
            .attr('y', (d) => this.y(d.avg) )
            .attr('width', this.x.bandwidth())
            .attr('height', (d) => this.height - this.y(d.avg) );
    }

}
