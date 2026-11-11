import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private readonly toastsSource = new BehaviorSubject<Toast[]>([]);

  readonly toasts$ = this.toastsSource.asObservable();

  show(message: string, type: ToastType = 'success', duration = 3800): void {
    const toast: Toast = { id: ++this.counter, message, type };

    this.toastsSource.next([...this.toastsSource.value, toast]);
    window.setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5000);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this.toastsSource.next(this.toastsSource.value.filter((toast) => toast.id !== id));
  }
}
