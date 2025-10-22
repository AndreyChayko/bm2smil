import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly http = inject(HttpClient);

  protected readonly status = signal<'idle' | 'loading' | 'ok' | 'error'>('idle');
  protected readonly message = signal<string>('');
  protected readonly error = signal<string>('');
  protected readonly apiUrl = signal<string>(`${environment.apiBaseUrl}/api/health`);

  async ping(): Promise<void> {
    this.status.set('loading');
    this.error.set('');
    try {
      const text = await firstValueFrom(
        this.http.get(this.apiUrl(), { responseType: 'text' as const }),
      );
      this.message.set(text);
      this.status.set('ok');
    } catch (e: unknown) {
      this.error.set(String((e as { message?: string })?.message ?? e));
      this.status.set('error');
    }
  }
}
