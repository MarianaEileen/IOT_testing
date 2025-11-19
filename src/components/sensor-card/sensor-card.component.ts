import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sensor-card',
  templateUrl: './sensor-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorCardComponent {
  label = input.required<string>();
  value = input<number | null>(null);
  unit = input.required<string>();
  icon = input.required<string>(); // SVG path data
  isLoading = input<boolean>(false);
}
