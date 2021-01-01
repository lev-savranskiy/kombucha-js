import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import {DataService} from '../shared/service';


export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

@Component({
    selector: 'app-stacked-bar-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './stacked-bar-chart.component.html',
    styleUrls: ['./stacked-bar-chart.component.css']
})
export class StackedBarChartComponent implements OnInit {

    title = 'Store performance';

    private margin: Margin;
    private data: object[] = [];
    private devdata: any;
    private width: number;
    private height: number;
    public message: string;

    private svg: any;


    private x: any;
    private y: any;
    private z: any;
    private g: any;
    storeId  = '';

    constructor(private dataService: DataService,  private router: ActivatedRoute) {
    }

    ngOnInit() {
        this.storeId = this.router.snapshot.paramMap.get('storeId') || 'Nationwide';
        console.log('this.storeId', this.storeId);
        this.devdata = this.dataService.getCachedData();
        this.prepareData();
        if (this.data.length > 0) {
            this.initMargins();
            this.initSvg();
            this.drawChart(this.data);
        } else {
            this.message = this.dataService.noDataMessage;
        }
    }


    private initMargins() {
        this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    }


    private prepareData() {
        // console.log('prepareData');
        const obj = {};
        this.devdata.forEach(el => {
            const agentId = el.agentId;
            const hasSale = el.transactionType.indexOf('SALE') > -1;
            obj[agentId] = obj[agentId] || {
                // total: 0,
                other: 0,
                sales: 0
            };

            // obj[agentId].total++;
            if (hasSale) {
                obj[agentId].sales++;
            } else {
                obj[agentId].other++;
            }


        });

        Object.keys(obj).forEach((k) => {
            this.data.push({other: obj[k].other, sales: obj[k].sales, agentId: k});
        });

        // this.tdata.sort(function (a, b) {
        //     return a.total - b.total;
        // });

        //console.log(this.data);
    }

    private initSvg() {
        this.svg = d3.select('svg');

        this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
        this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
        this.g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.x = d3Scale.scaleBand()
            .rangeRound([0, this.width])
            .paddingInner(0.05)
            .align(0.1);
        this.y = d3Scale.scaleLinear()
            .rangeRound([this.height, 0]);
        this.z = d3Scale.scaleOrdinal()
            .range(['green', 'red']);
    }

    private drawChart(data: any[]) {

        // const keys = Object.getOwnPropertyNames(tdata[0]).slice(1);
        const keys = ['sales', 'other'];

        data = data.map(v => {
            v.total = keys.map(key => v[key]).reduce((a, b) => a + b, 0);
            return v;
        });
        data.sort((a: any, b: any) => b.sales - a.sales);

        this.x.domain(data.map((d: any) => d.agentId));
        this.y.domain([0, d3Array.max(data, (d: any) => d.total)]).nice();
        this.z.domain(keys);

        this.g.append('g')
            .selectAll('g')
            .data(d3Shape.stack().keys(keys)(data))
            .enter().append('g')
            .attr('fill', d => this.z(d.key))
            .selectAll('rect')
            .data(d => d)
            .enter().append('rect')
            .attr('x', d => this.x(d.data.agentId))
            .attr('y', d => this.y(d[1]))
            .attr('height', d => this.y(d[0]) - this.y(d[1]))
            .attr('width', this.x.bandwidth());

        this.g.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x))
            .selectAll('text')
            .style('text-anchor', 'end')
            // .attr('dx', '-.8em')
            // .attr('dy', '.15em')
            .attr('transform', 'rotate(-15)');

        this.g.append('g')
            .attr('class', 'axis')
            .call(d3Axis.axisLeft(this.y).ticks(this.data[0]['total']))
            .append('text')
            .attr('x', 2)
            .attr('y', this.y(this.y.ticks().pop()) + 0.5)
            .attr('dy', '0.32em')
            .attr('fill', '#000')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start');
        // .text('Population');

        const legend = this.g.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('text-anchor', 'end')
            .selectAll('g')
            .data(keys.slice().reverse())
            .enter().append('g')
            .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

        legend.append('rect')
            .attr('x', this.width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', this.z);

        legend.append('text')
            .attr('x', this.width - 24)
            .attr('y', 9.5)
            .attr('dy', '0.32em')
            .text(d => d);
    }

}
