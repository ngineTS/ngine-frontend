import { Component, SimpleChanges } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { UserEventService } from '../../core/services/user-event.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';


@Component({
  selector: 'app-analytic',
  imports: [NgxChartsModule, MatTooltipModule],
  templateUrl: './analytic.component.html',
  styleUrl: './analytic.component.scss'
})
export class AnalyticComponent extends NavigationBaseComponent {

  constructor(public _userEventService: UserEventService) { super(); }

  connectionChartData: Array<{
    name: string; 
    series: Array<{
      name: string;
      value: number
    }>
  }> = [];

  mauChartData: Array<{
    name: string;
    value: number
  }> = [];

  urlVisitCharData: Array<{
    name: string;
    value: number
  }> = [];

  gradient = false;
  connectionChartDimensions: [number, number] = [0, 0];
  colorScheme: Color = { 
    name: '',
    selectable: true,
    group: ScaleType.Linear,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] 
  };

  ngOnInit() {
    this._userEventService.getSessionCountByDay().subscribe(resp => {
      this.connectionChartData.push({
        name: 'connections',
        series: resp
      });
    })
    this._userEventService.getMonthlyActiveUsers().subscribe(resp => {
      this.mauChartData = resp;
    });
    this._userEventService.getNumberOfVisitByUrl().subscribe(resp => {
      this.urlVisitCharData = resp;
    });
  }

  ngAfterViewInit() {
    this.connectionChartDimensions = [Number(this._navigation.containerLayout.width! * window.innerWidth / 100) * 0.88, 0]
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges["_sizeChanged"]) {
      this.connectionChartDimensions = [Number(this._navigation.containerLayout.width! * window.innerWidth / 100) * 0.88, 0]
    }
  }
}
