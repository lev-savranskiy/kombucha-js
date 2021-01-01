import {Component, OnInit} from '@angular/core';
import {DataService} from './shared/service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    constructor(private dataService: DataService, private router: Router) {
        this.date = this.dataService.getDate();
        console.log('AppComponent constructor');
    }

    date: string;
    devdata: any = [];
    title = 'Agent Data Visualizations';
    url = 'retail.xmobiletest.com/xm-dev-portal/';
    routes = [

        {
            title: 'Transactions Sequences',
            route: '/sequences'
        },

        {
            title: 'Sales by State',
            route: '/map'
        },
        {
            title: 'Activations  by Channel',
            route: '/multi-series-2'
        },


        {
            title: 'Store performance',
            route: '/stacked-bar-chart'
        },
        {
            title: 'Duration by Agent',
            route: '/bar-chart-2'
        },
        {
            title: 'Channels Depiction',
            route: '/pie-chart-2'
        },

        {
            title: 'Environments Depiction',
            route: '/donut-chart'
        },

        {
            title: 'Duration by Channel',
            route: '/multi-series'
        },
        {
            title: 'Duration Aggregate',
            route: '/brush-zoom'
        },

        {
            title: 'Transactions Radar',
            route: '/radar'
        }
    ];

    ngOnInit() {
        console.log('AppComponent ngOnInit');
        this.reloadData();
    }


    doNavigate = () => {
        const currentUrl = this.router.url;
        const switchUrl = currentUrl === this.routes[0].route ? this.routes[1].route : this.routes[0].route;
        // force reload workaround
        this.router.navigate([switchUrl])
            .then(() => {
                this.router.navigate([currentUrl]);
            });
    }

    reloadData = () => {

        console.log('reloadData');
       // console.log(this.date);

        this.dataService.setDate(this.date);
        this.devdata = this.dataService.getCachedData();

        if (this.devdata && this.devdata.length) {
            this.doNavigate();
        } else {
            this.dataService.getData().subscribe((data) => {
                console.log('[subscribe in AppComponent]');
                // console.log(data);
                this.devdata = data;
                this.doNavigate();
            });
        }


    }

}
