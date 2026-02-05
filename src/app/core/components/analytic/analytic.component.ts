import { Component } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { UserEventService } from '../../services/user-event.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';


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
  connectionChartDimensions: [number, number] = [window.innerWidth * 0.75, 300];
  colorScheme: Color = { 
    name: '',
    selectable: true,
    group: ScaleType.Linear,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] 
  };

  ngOnInit() {
    this._userEventService.getSessionCountByDay().subscribe(resp => {
      console.log(resp);
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

  onResize(event: any) {
    this.connectionChartDimensions = [event.target.innerWidth / 1.35, 300];
  }

}
