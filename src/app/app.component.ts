import {AfterViewInit, Component} from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  title = 'ellipsis-angular-demo';
  html = '';

  constructor(private http: HttpClient) {
  }

  private fetchFacts() {
    Promise.all([
      this.http.get('https://catfact.ninja/fact').toPromise(),
      this.http.get('https://catfact.ninja/fact').toPromise(),
      this.http.get('https://catfact.ninja/fact').toPromise()
    ]).then((facts: any[]) => {
      this.html = `
        <h2>${facts[0].fact}</h2>
        <code>${facts[1].fact}</code>
        <p>
        <i>${facts[2].fact}</i>
        <i>${facts[2].fact}</i>
        <i>${facts[2].fact}</i>
        <i>${facts[2].fact}</i>
        </p>
      `;
    })
  }

  ngAfterViewInit() {
    this.fetchFacts();
    setInterval(() => this.fetchFacts(), 10000)
  }
}
