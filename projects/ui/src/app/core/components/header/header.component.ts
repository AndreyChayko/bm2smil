import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly server = inject(ServerService);

  readonly healthy = this.server.healthy;
  readonly checking = this.server.checking;

  readonly statusText = computed(() => {
    if (this.checking()) return 'Connecting...';
    const h = this.healthy();
    if (h === null) return 'Unknown';
    return h ? 'Server online' : 'Server offline';
  });

  readonly statusClass = computed(() => {
    if (this.checking()) return 'badge badge--warn';
    const h = this.healthy();
    if (h === null) return 'badge badge--warn';
    return h ? 'badge badge--ok' : 'badge badge--err';
  });

  pingNow() {
    void this.server.ping();
  }
}
