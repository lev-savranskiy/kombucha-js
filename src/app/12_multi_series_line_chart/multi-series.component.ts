import {Component, ViewEncapsulation, OnInit} from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import {DataService} from '../shared/service';


@Component({
    selector: 'app-multi-series-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './multi-series.component.html',
    styleUrls: ['./multi-series.component.css']
})
export class MultiSeries2Component implements OnInit {

    title = 'Week 49: 12/10-12/16  Activations  by Channel';
    private data: object[] = [];
    private devdata: any;
    tdata: any;
    maxValue = 0;
    message = '';
    svg: any;
    margin = {top: 20, right: 80, bottom: 30, left: 50};
    g: any;
    width: number;
    height: number;
    channels: Array<string> = ['TELESALES', 'RETAIL'];
    x;
    y;
    z;
    line;

    constructor(private dataService: DataService) {
    }


    ngOnInit() {
        this.devdata = this.dataService.getCachedData();

        if (this.devdata.length > 0) {
            this.prepareData();
            this.tdata = this.data.map((v) => v['values'].map((val) => val.date))[0];
            this.tdata = this.tdata.concat(this.data.map((v) => v['values'].map((val) => val.date))[1]);
            this.initChart();
            this.drawAxis();
            this.drawPath();
        } else {
            this.message = this.dataService.noDataMessage;
        }
    }

    private prepareData() {
        // console.log('prepareData');
        const obj = {};
        obj[this.channels[0]] = [];
        obj[this.channels[1]] = [];


        this.devdata.forEach(el => {
            if (el.duration > this.maxValue) {
                this.maxValue = el.duration;
            }
            obj[el.channelName].push({'date': new Date(el.startTime), 'value': el.duration / 1000 / 60});
        });

        obj[this.channels[0]].sort(function (a, b) {
            return a.date - b.date;
        });

        obj[this.channels[1]].sort(function (a, b) {
            return a.date - b.date;
        });

        this.data = [
            {id: this.channels[0], values: obj[this.channels[0]]},
            {id: this.channels[1], values: obj[this.channels[1]]}
        ];

        this.data = [
            {id: this.channels[0], values: [
                    {'date': new Date(2018, 11, 10), 'value': 90},
                    {'date': new Date(2018, 11, 11), 'value': 112},
                    {'date': new Date(2018, 11, 12), 'value': 86},
                    {'date': new Date(2018, 11, 13), 'value': 79},
                    {'date': new Date(2018, 11, 14), 'value': 150},
                    {'date': new Date(2018, 11, 15), 'value': 101},
                    {'date': new Date(2018, 11, 16), 'value': 85},
                ]},
            {id: this.channels[1], values:  [
                    {'date': new Date(2018, 11, 10), 'value': 27},
                    {'date': new Date(2018, 11, 11), 'value': 7},
                    {'date': new Date(2018, 11, 12), 'value': 19},
                    {'date': new Date(2018, 11, 13), 'value': 22},
                    {'date': new Date(2018, 11, 14), 'value': 24},
                    {'date': new Date(2018, 11, 15), 'value': 18},
                    {'date': new Date(2018, 11, 16), 'value': 11},
                ]}
        ];

        this.tdata  = [
new Date(2018, 11, 10),
new Date(2018, 11, 11),
new Date(2018, 11, 12),
new Date(2018, 11, 13),
new Date(2018, 11, 14),
new Date(2018, 11, 15),
new Date(2018, 11, 16)
        ];

       // console.log(this.tdata);
    }


    private initChart(): void {
        this.svg = d3.select('svg');

        this.width = this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = this.svg.attr('height') - this.margin.top - this.margin.bottom;

        this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.x = d3Scale.scaleTime().range([0, this.width]);
        this.y = d3Scale.scaleLinear().range([this.height, 0]);
        this.z = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);

        this.line = d3Shape.line()
            .curve(d3Shape.curveBasis)
            .x((d: any) => this.x(d.date))
            .y((d: any) => this.y(d.value));

        const xdomain = d3Array.extent(this.tdata, (d: Date) => d);
        this.x.domain(xdomain);

        this.y.domain([
            0,
            d3Array.max(this.data, function (c) {
                return d3Array.max(c['values'], function (d) {
                    return d['value'];
                });
            })
        ]);

        this.z.domain(this.data.map(function (c) {
            return c['id'];
        }));
    }

    private drawAxis(): void {
        this.g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x));

        this.g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '0.71em')
            .attr('fill', '#000')
            .text('Activations');
    }

    private drawPath(): void {
        const channel = this.g.selectAll('.channel')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'channel');

        channel.append('path')
            .attr('class', 'line')
            .attr('d', (d) => this.line(d.values))
            .style('stroke', (d) => this.z(d.id));


        channel.append('text')
            .datum(function (d) {
                return {id: d.id, value: d.values[d.values.length - 1]};
            })
            .attr('transform', (d) => 'translate(50,' + this.channels.indexOf(d.id) * 25 + ')')
            .style('fill', (d) => d3ScaleChromatic.schemeCategory10[this.channels.indexOf(d.id)])
            .style('font', '15px sans-serif')
            .text(function (d) {
                return d.id;
            });
    }

}
