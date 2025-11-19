import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService, SensorData } from './services/sensor.service';
import { SensorCardComponent } from './components/sensor-card/sensor-card.component';
import { LedControlComponent } from './components/led-control/led-control.component';
import { catchError, finalize, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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
  sensorData = signal<Partial<SensorData>>({ temperature: null, humidity: null, timestamp: null });
  ledState = signal<'on' | 'off' | 'unknown'>('unknown');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
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
            timestamp: data.timestamp, // Store the timestamp from the API
          });
          this.error.set(null); // Clear any previous errors
        } else {
          // No data found in database - show friendly message
          const errorMessage = data.error === 'No sensor data found'
              ? '⏳ Esperando datos del sensor... La base de datos está vacía.'
              : (typeof data.error === 'string'
                  ? data.error
                  : 'The backend returned a successful response but with an unspecified error.');
          this.error.set(errorMessage);
          // Keep previous data if exists, otherwise null
          if (!this.sensorData().temperature) {
            this.sensorData.set({ temperature: null, humidity: null, timestamp: null });
          }
        }
      }),
      catchError((err: unknown) => {
        console.error('API Error:', err);
        this.handleApiError(err);
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
      catchError((err: unknown) => {
        console.error('LED Control Error:', err);
        // Revert UI on error
        this.ledState.set(previousState);
        this.handleApiError(err, 'Failed to control LED.');
        return of(null);
      })
    ).subscribe();
  }

  private handleApiError(err: unknown, context: string = 'Could not connect to the sensor API.'): void {
      let errorMessage = context;

      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          // This is a client-side or network error, often CORS.
          errorMessage = 'Network Error or CORS Issue. Ensure the Flask backend has CORS enabled and is accessible.';
        } else {
          // This is a server-side error.
          errorMessage = `Backend returned code ${err.status}: ${err.statusText}. Please check server logs.`;
        }
      } else if (err instanceof Error) {
        // Handle standard JavaScript Error objects
        errorMessage = err.message;
      }
      
      this.handleError(errorMessage);
  }

  private handleError(errorMessage: string): void {
    this.error.set(errorMessage);
    // Don't clear data - keep showing last known values
    // Only clear if there was never any data
    if (!this.sensorData().temperature && !this.sensorData().humidity) {
      this.sensorData.set({ temperature: null, humidity: null, timestamp: null });
    }
  }
}