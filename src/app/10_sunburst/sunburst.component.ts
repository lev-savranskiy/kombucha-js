import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import {DataService} from '../shared/service';
import * as d3 from 'd3';
import * as d3Hierarchy from 'd3-hierarchy';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import {Channel} from '../shared/channel';

//
@Component({
    selector: 'app-sunburst',
    templateUrl: './sunburst.component.html',
    styleUrls: ['./sunburst.component.css']
})
export class SunburstComponent implements OnInit {


    channel: Channel;
    selectedChannel;
    title = 'Transactions Sequences';
    sequenceArray = [];
    message = '';
    private margin = {top: 20, right: 20, bottom: 30, left: 50};
    private width: number;
    private height: number;
    public totalSize = 0;
    private data: object = {};
    private devdata: any;
    private elId = '#sunburst';
    private color = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);
    private b = {
        w: 75, h: 30, s: 3, t: 10
    };

    itemPluralMapping = {
        'session': {
            '=1' : '1 session',
            'other' : '# sessions'
        }
    };

    static getAncestors(node) {
        const path = [];
        let current = node;
        while (current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        // console.log('[getAncestors]');
        // console.log(path);
        return path;
    }

    constructor(private dataService: DataService) {
        this.channel = new Channel();
        this.selectedChannel = this.channel.id;
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }


    updateChannel(selectedChannel): void {
        this.channel = selectedChannel;
        this.selectedChannel = this.channel.id;
        this.ngOnInit();
    }



    ngOnInit() {
        this.devdata = this.dataService.getCachedData();
        if (this.devdata.length > 0) {
            this.prepareData();
            this.initSvg();
        } else {
            this.message = this.dataService.noDataMessage;
        }

    }

    goToSessions() {
        alert('Go To Sessions Details (todo)');
    }

    private prepareData() {

        const result = {name: 'SEQUENCES', children: []};
        let parent = result;
        this.totalSize = this.devdata.length;
        this.devdata.forEach(o => {
            const channelName = o.channelName;
            const shouldProceed =  this.selectedChannel === 'AGGREGATE' || this.selectedChannel === channelName;

            // filter data by selectedChannel
            if (!shouldProceed) {
                this.totalSize--;
                return;
            }
            const transactionType = JSON.parse(o.transactionType);
            const len = transactionType.length;

            transactionType.forEach(function (t, depth) {

                const isLast = depth === (len - 1);
                if (!parent['children']) {
                    parent['children'] = [];
                }

                let node = parent['children'].find(function (element) {
                    return element.name === t;
                });

                if (!node) {
                    node = {name: t, size: 0, depth: depth};
                    parent['children'].push(node);
                }
                node['size']++;
                if (isLast) {
                    parent = result;
                } else {
                    parent = node;
                }
            });
        });

        this.data = result;
    }


    private initSvg() {

        const width = 800;
        const height = 800;
        const radius = Math.min(width, height) / 2;


        // clear all buit svg
        this.sequenceArray = [];
        d3.select(`${this.elId} > *`).remove();
        // Create primary <g> element
        const g = d3.select(this.elId)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Data structure
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Find data root
        const root = d3.hierarchy(this.data)
            .sum(function (d) {
                return d['size'];
            });

        // Size arcs
        partition(root);
        const arc = d3.arc()
            .startAngle(function (d) {
                return d['x0'];
            })
            .endAngle(function (d) {
                return d['x1'];
            })
            .innerRadius(function (d) {
                return d['y0'];
            })
            .outerRadius(function (d) {
                return d['y1'];
            });

        const computeTextRotation =  (d) => {
            const angle = (d.x0 + d.x1) / Math.PI * 90;

            // Avoid upside-down labels
            // return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
            return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
        };

        const mouseover = (node) => {

            // console.log(node);
            // console.log(this);

            const percentage = 100 * node.data.size / this.totalSize;
            let percentageString = percentage.toPrecision(3) + '%';
            if (percentage < 0.1) {
                percentageString = '< 0.1%';
            }

            d3.select('#percentage')
                .text(percentageString);

            d3.select('#explanation')
                .style('visibility', percentage > 0 ? '' : 'hidden');

            if (percentage > 0) {
                this.sequenceArray = SunburstComponent.getAncestors(node);

                //
                // Fade all the segments.
                d3.selectAll('path')
                    .style('opacity', 0.5);

                // Then highlight only those that are an ancestor of the current segment.
                g.selectAll('path')
                    .filter((_node) => (this.sequenceArray.indexOf(_node) >= 0))
                    .style('opacity', 1);
            }

        };

        const mouseleave = (d) => {

            // // todo
            // return;
            // setTimeout(function () {
            //     d3.selectAll('path')
            //         .transition()
            //         .duration(1000)
            //         .style('opacity', 1);
            // }, 1000);


            // Deactivate all segments during transition.
            d3.selectAll('path').on('mouseover', null);

            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll('path')
                .transition()
                .duration(1000)
                .style('opacity', 1)
                .on('end',  () =>  d3.select(this).on('mouseover', mouseover));

            // d3.selectAll('path').on('mouseover', mouseover);
            d3.select('#explanation')
                .style('visibility', 'hidden');
        };


        // Put it all together
        g.selectAll('g')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .append('path')
            .attr('d', arc)
            .style('stroke', '#fff')
            .style('fill', (d) => {
                if (d.depth === 0) {
                    return '#fff';
                }
                return this.color((d.children ? d : d.parent).data.name);
            })
            .on('mouseover', mouseover);
        //.on('mouseleave', mouseleave);


        // Populate the <text> elements with our data-driven titles.
        g.selectAll('.node')
            .append('text')
            .attr('transform',  (d) => {
                return 'translate(' + arc.centroid(d) + ')rotate(' + computeTextRotation(d) + ')';
            })
            .attr('font-size', 9)
            .style('fill', '#fff')
            .style('cursor', 'pointer')
            .attr('dx', '-25')
            .attr('dy', '.5em')
            .text( (d) => {
                return d.parent ? d.data.name : '';
            });
    }


}
