import { ChangeDetectionStrategy, Component, output, input, computed } from '@angular/core';

type LedState = 'on' | 'off' | 'unknown';

@Component({
  selector: 'app-led-control',
  templateUrl: './led-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedControlComponent {
  ledState = input<LedState>('unknown');
  action = output<'on' | 'off'>();

  isOn = computed(() => this.ledState() === 'on');

  turnOn() {
    this.action.emit('on');
  }

  turnOff() {
    this.action.emit('off');
  }
}
