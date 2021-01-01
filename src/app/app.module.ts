import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule, MatSidenavModule } from '@angular/material';
import { AgmCoreModule } from '@agm/core';
import { AppComponent } from './app.component';
import { LineChartComponent } from './01_line_chart/line-chart.component';
import { MultiSeriesComponent } from './02_multi_series_line_chart/multi-series.component';
import { MultiSeries2Component } from './12_multi_series_line_chart/multi-series.component';
import { BarChartComponent } from './03_bar_chart/bar-chart.component';
import { BarChart2Component } from './08_bar_chart/bar-chart.component';
import { StackedBarChartComponent } from './04_stacked_bar_chart/stacked-bar-chart.component';
import { BrushZoomComponent } from './05_brush_zoom/brush-zoom.component';
import { PieChartComponent } from './06_pie_chart/pie-chart.component';
import { PieChart2Component } from './09_pie_chart/pie-chart.component';
import { DonutChartComponent } from './07_donut_chart/donut-chart.component';
import { SunburstComponent } from './10_sunburst/sunburst.component';
import { MapComponent } from './11_map/map.component';

import { DataService } from './shared/service';
import { RadarComponent } from './13_radar/radar.component';
import { ChannelSelectorComponent } from './channel-selector/channel-selector.component';

const appRoutes: Routes = [
    { path: 'line-chart', component: LineChartComponent },
    { path: 'multi-series', component: MultiSeriesComponent },
    { path: 'multi-series-2', component: MultiSeries2Component },
    { path: 'bar-chart', component: BarChartComponent },
    { path: 'bar-chart-2', component: BarChart2Component },
    { path: 'stacked-bar-chart/:storeId', component: StackedBarChartComponent },
    { path: 'brush-zoom', component: BrushZoomComponent },
    { path: 'pie-chart', component: PieChartComponent },
    { path: 'pie-chart-2', component: PieChart2Component },
    { path: 'donut-chart', component: DonutChartComponent },
    { path: 'sequences', component: SunburstComponent },
    { path: 'radar', component: RadarComponent },
    { path: 'map', component: MapComponent },
    { path: '',
        redirectTo: '/sequences',
        pathMatch: 'full'
    },
    { path: '**', component: StackedBarChartComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        LineChartComponent,
        MultiSeriesComponent,
        MultiSeries2Component,
        BarChartComponent,
        BarChart2Component,
        StackedBarChartComponent,
        BrushZoomComponent,
        PieChartComponent,
        PieChart2Component,
        DonutChartComponent,
        SunburstComponent,
        MapComponent,
        RadarComponent,
        ChannelSelectorComponent
    ],
    imports: [
        HttpClientModule,
        FormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDp0lDvhAQodn0Z5lqmqwPcmCzsKAajEdI'
        }),
        RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'}),
        MatMenuModule,
        MatSidenavModule,
    ],
    providers: [DataService],
    exports: [RouterModule],
    bootstrap: [AppComponent]
})
export class AppModule { }
