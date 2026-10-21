import { EmployeeShowComponent } from './employee-show/employee-show.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-employee',
    imports: [RouterOutlet],
    templateUrl: './employee.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './employee.component.css'
})
export class EmployeeComponent {

}
