import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-invoice',
    imports: [RouterOutlet],
    templateUrl: './invoice.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invoice.component.css'
})
export class InvoiceComponent {

}
