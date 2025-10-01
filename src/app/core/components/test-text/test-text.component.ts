import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation } from '../../models/navigation.interface';
import { HttpClient } from '@angular/common/http';
import { TestText, TestTextPayload } from '../../models/test-text.interface';
import { environment } from '../../../../environments/environment';
import { GenericFormService, Person } from '../../services/generic-form.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { DeepFormConfig } from '../../models/form-input.interface';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-test-text',
  imports: [CommonModule],
  templateUrl: './test-text.component.html',
  styleUrl: './test-text.component.scss',
})
export class TestTextComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _genericFormService: GenericFormService,
              private _matDialog: MatDialog) {}

  @Input() navigation!: Navigation;
  content!: TestText;

  /*currentWidth = 300;
  currentHeight = 200;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Update dimensions if needed
    console.log(event);
  }*/

  ngOnInit() {
    this._http.get<TestText>(`${environment.APIURL}test-text/navigation/${this.navigation.id}`).subscribe(resp => {
      this.content = resp;
    });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

  onSpanClick() {
  }

  openGenericForm() {
    const items: number[] = [1, 2, 3];
    const a = 'a';
    const items2: number[] = [10, 20, 30, 40];
    const personInputs: DeepFormConfig<Person> = {
      numberArray: {
        value: [1, 2],
        validators: [Validators.required],
        type: 'dropdown',
        dropdownConfig: {
          items: items
        }
      },
      book: this._genericFormService.defineInputFormat(
        this._genericFormService.lucas,
        'book',
        [],
        'dropdown',
        {
          bindLabel: 'b',
          bindValue: 'a',
          items:  [{a: 'a', b: 1}, {a: 'a2', b: 2}, {a: 'a3', b: 3}]
        }
      ),
      job: {
        value: true,
        validators: [],
        type: 'checkbox'
      }
      ,
      child: {
        a: {
          value: this._genericFormService.lucas.child["a"],
          validators: [Validators.required],
          type: 'dropdown',
          dropdownConfig: {
            items: items2
          }
        },
        b: {
          value: this._genericFormService.lucas.child["b"],
          validators: [],
          type: 'textarea'
        },
        grandChild: {
          c: {
            value: this._genericFormService.lucas.child.grandChild["c"],
            validators: [Validators.required, Validators.max(22)],
            type: 'number'
          },
          d: {
            value: this._genericFormService.lucas.child.grandChild["d"],
            validators: [Validators.required],
            type: 'date-and-time'
          }
        }
      }
    }

    this._matDialog.open(
      GenericFormComponent<TestTextPayload>,
      { 
        maxWidth: '700px',
        data: {
          formConfig: personInputs,
          id: null, //this.content.id,
          navigationId: null, //this.content.navigationId,
          controllerName: 'test-text',
        }
      }
    );
  }

}