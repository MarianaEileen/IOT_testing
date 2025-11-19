import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SensorData {
  success: boolean;
  error?: string;
  temperature: number;
  humidity: number;
  timestamp?: string; // To hold the reading's date and time
}

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private http = inject(HttpClient);

  // IMPORTANT: Replace 'http://localhost:5000' with your Raspberry Pi's IP address.
  // For example: 'http://192.168.1.100:5000'
  private readonly API_URL = 'http://78.12.149.93';

  getSensorData(): Observable<SensorData> {
    return this.http.get<SensorData>(`${this.API_URL}/sensor`);
  }

  controlLed(action: 'on' | 'off'): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('action', action);
    // The Python backend expects a redirect, so the response might not be JSON.
    // We set responseType to 'text' to avoid JSON parsing errors on redirect.
    return this.http.post(`${this.API_URL}/led`, body.toString(), { headers, responseType: 'text' });
  }
}