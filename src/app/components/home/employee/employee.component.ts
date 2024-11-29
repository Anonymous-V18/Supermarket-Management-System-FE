import { EmployeeShowComponent } from './employee-show/employee-show.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-employee',
    imports: [RouterOutlet],
    templateUrl: './employee.component.html',
    styleUrl: './employee.component.css'
})
export class EmployeeComponent {

}
