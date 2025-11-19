import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService, SensorData } from './services/sensor.service';
import { SensorCardComponent } from './components/sensor-card/sensor-card.component';
import { LedControlComponent } from './components/led-control/led-control.component';
import { catchError, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SensorCardComponent, LedControlComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private sensorService = inject(SensorService);
  private pollingInterval: any;

  // Signals for state management
  sensorData = signal<Partial<SensorData>>({ temperature: null, humidity: null });
  ledState = signal<'on' | 'off' | 'unknown'>('unknown');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);
  
  // Icon paths for sensor cards
  temperatureIcon = 'M13 16V3a1 1 0 00-1-1H9a1 1 0 00-1 1v13a4 4 0 105 0zM9 4h2v9H9V4z';
  humidityIcon = 'M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69zM12 18a5.98 5.98 0 005.65-4H6.35A5.98 5.98 0 0012 18z';

  ngOnInit(): void {
    this.fetchData(); // Initial fetch
    this.pollingInterval = setInterval(() => this.fetchData(), 5000); // Poll every 5 seconds
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  fetchData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sensorService.getSensorData().pipe(
      tap((data) => {
        if (data.success) {
          this.sensorData.set({
            temperature: data.temperature,
            humidity: data.humidity,
          });
          this.lastUpdated.set(new Date());
        } else {
          this.handleError(data.error || 'Failed to get sensor data.');
        }
      }),
      catchError(err => {
        console.error('API Error:', err);
        this.handleError('Could not connect to the sensor API. Make sure the backend is running and the API URL is correct.');
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe();
  }

  handleLedAction(action: 'on' | 'off'): void {
    this.error.set(null);
    // Optimistically update UI
    const previousState = this.ledState();
    this.ledState.set(action);

    this.sensorService.controlLed(action).pipe(
      catchError(err => {
        console.error('LED Control Error:', err);
        // Revert UI on error
        this.ledState.set(previousState);
        this.handleError('Failed to control LED.');
        return of(null);
      })
    ).subscribe();
  }

  private handleError(errorMessage: string): void {
    this.error.set(errorMessage);
    this.sensorData.set({ temperature: null, humidity: null });
  }

  // Helper method for template to avoid new Date()
  getFormattedTime(): string | null {
    const date = this.lastUpdated();
    if (!date) return null;
    return date.toLocaleTimeString();
  }
}
