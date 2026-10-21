import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product',
    imports: [RouterOutlet],
    templateUrl: './product.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './product.component.css'
})
export class ProductComponent {

}
