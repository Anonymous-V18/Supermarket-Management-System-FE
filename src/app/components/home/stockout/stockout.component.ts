import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-stockout',
    imports: [RouterOutlet],
    templateUrl: './stockout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './stockout.component.css'
})
export class StockoutComponent {

}
