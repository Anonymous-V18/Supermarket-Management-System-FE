import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-stockin',
  imports: [RouterOutlet],
  templateUrl: './stockin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stockin.component.css',
})
export class StockinComponent {}
