import { Injectable } from '@angular/core';
import { HttpClient   } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable()
export class DataService {

    constructor(private http: HttpClient) {
        this.setDate(DataService.getCurDate());
        this.cache = {};
        console.log('DataService constructor');
    }

    public noDataMessage  = 'No data found for this date.';
    public cache: object;
    public data: any[] = [];
    public date: string;
    public apiUrl = 'https://retail.xmobiletest.com:8443/devportalservice/api/transaction/?dateStr=';


    static getCurDate () {
        const d = new Date();
        return '2018-12-12';
        // return [  d.getFullYear() , String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    }

    public setDate(date) {
        this.date = date;
    }

    public getDate() {
        return this.date;
    }


    public getData() {
        const dt = this.getDate();
        console.log(`[getData for ${dt}]`);
        const url = `assets/api/2018-12-12.json`;
       // const url = `${this.apiUrl}${this.getDate()}`;
       // console.log(url);
        return this.http.get(url).pipe(map(res => {
            this.cache[dt]  = res;
            return res;
        }));
    }


    public getCachedData() {
        const dt = this.getDate();
        if (this.cache[dt]) {
            console.log(`[cache found for ${dt}]`);
            return this.cache[dt];
        }
        console.log(`[cache not found for ${dt}]`);
        return [];
    }
}
