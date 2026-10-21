import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-warehouse',
  imports: [RouterOutlet],
  templateUrl: './warehouse.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './warehouse.component.css',
})
export class WarehouseComponent {}
