import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConverterService } from './converter.service';

@Component({
  selector: 'app-converter-page',
  imports: [FormsModule],
  templateUrl: './converter.page.html',
  styleUrl: './converter.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterPageComponent {
  protected readonly svc = inject(ConverterService);

  // Drag & drop UI state
  protected readonly dragging = signal(false);

  onUrlInput(el: HTMLInputElement) {
    this.svc.url.set(el.value);
  }

  onJsonInput(el: HTMLTextAreaElement) {
    this.svc.jsonText.set(el.value);
  }

  convertByUrl() {
    this.svc.triggerConvertByUrl();
  }
  convertByJson() {
    this.svc.triggerConvertByJson();
  }

  onFileChange(input: HTMLInputElement) {
    const file = input.files?.[0] || null;
    if (file) {
      this.svc.triggerConvertByFile(file);
      input.value = '';
    }
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.dragging.set(true);
  }
  onDragLeave() {
    this.dragging.set(false);
  }
  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.dragging.set(false);
    const f = ev.dataTransfer?.files?.[0] || null;
    if (f) this.svc.triggerConvertByFile(f);
  }

  removeFile() {
    this.svc.clearFile();
  }

  protected readonly navigator = navigator;
  protected readonly encodeURIComponent = encodeURIComponent;
}
