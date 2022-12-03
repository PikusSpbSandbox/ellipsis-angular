import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { HttpClient } from "@angular/common/http";

const SIZE_CLASSES = ['small', 'medium', 'large'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('demo1') demo1!: ElementRef;

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
    setInterval(() => this.fetchFacts(), 10000);
    setInterval(() => {
      this.demo1.nativeElement.className = SIZE_CLASSES[Math.trunc(Math.random() * 3)];
    }, 5000);
  }
}
