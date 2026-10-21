import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-supplier',
  imports: [RouterOutlet],
  templateUrl: './supplier.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './supplier.component.css',
})
export class SupplierComponent {}
