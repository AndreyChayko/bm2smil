import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GlobalMessagesService } from '../../services/global-messages.service';

@Component({
  selector: 'app-global-messages',
  templateUrl: './global-messages.component.html',
  styleUrl: './global-messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalMessagesComponent {
  protected readonly svc = inject(GlobalMessagesService);
  protected readonly msg = this.svc.active;

  protected readonly toastClass = computed(() => {
    const m = this.msg();
    const base = 'global-messages__toast';
    if (!m) return base;
    const mod = m.type === 'error' ? '--error' : m.type === 'success' ? '--success' : '--info';
    return `${base} ${base}${mod}`;
  });

  close() {
    this.svc.close();
  }
}
