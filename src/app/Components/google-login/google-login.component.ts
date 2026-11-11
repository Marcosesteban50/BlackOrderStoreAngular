import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SecurityService } from '../../Services/security.service';
import { CartService } from '../../Services/cart.service';
import { PromptNotification } from '../../Models/Security/google';


@Component({
  selector: 'app-google-login',
  imports: [],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoogleLoginComponent implements OnInit, AfterViewInit, OnDestroy {

  private router = inject(Router);
  private securityService = inject(SecurityService);
  private cartService = inject(CartService);
  private cdRef = inject(ChangeDetectorRef);

  @ViewChild('googleButton') googleButton!: ElementRef<HTMLElement>;

  loading = false;
  error = '';

  private googleInitialized = false;
  private readonly GOOGLE_CLIENT_ID = environment.googleClientId;
  private readonly destroy$ = new Subject<void>();

  // ==============================
  // LIFECYCLE
  // ==============================
  ngOnInit(): void {
    this.loadGoogleScript();
  }

  ngAfterViewInit(): void {
    // ViewChild disponible aquí. Si Google ya cargó, renderizamos el botón.
    if (this.googleInitialized) {
      this.renderGoogleButton();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==============================
  // PUBLIC API
  // ==============================
  triggerLogin(): void {
    if (this.loading) return;

    if (!this.isGoogleReady()) {
      this.error = 'Google Login no está disponible. Recarga la página.';
      this.cdRef.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdRef.detectChanges();

    // One Tap (prompt)
    window.google.accounts.id.prompt((notification: PromptNotification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: renderizar el botón estándar
        this.renderGoogleButton();
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  retry(): void {
    this.error = '';
    this.loading = false;
    this.googleInitialized = false;

    if (typeof window.google === 'undefined') {
      this.loadGoogleScript();
    } else {
      this.initializeGoogle();
      this.renderGoogleButton();
    }

    this.cdRef.detectChanges();
  }

  // ==============================
  // GOOGLE SCRIPT
  // ==============================
  private loadGoogleScript(): void {
    if (typeof window.google !== 'undefined') {
      this.initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=en';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initializeGoogle();
      // El botón sólo puede renderizarse cuando ViewChild existe
      if (this.googleButton) {
        this.renderGoogleButton();
      }
    };

    script.onerror = () => {
      this.error = 'Error cargando Google Login';
      this.cdRef.detectChanges();
    };

    document.head.appendChild(script);
  }

  private initializeGoogle(): void {
    if (this.googleInitialized) return;

    if (!this.GOOGLE_CLIENT_ID) {
      this.error = 'Google Client ID no configurado';
      this.cdRef.detectChanges();
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        itp_support: true
      });

      this.googleInitialized = true;
    } catch {
      this.error = 'Error configurando Google Login';
      this.cdRef.detectChanges();
    }
  }

  private renderGoogleButton(): void {
    const container = this.googleButton?.nativeElement;
    if (!container || !this.isGoogleReady()) return;

    container.innerHTML = '';

    window.google.accounts.id.renderButton(container, {
      type: 'icon',
      theme: 'filled_black',
      size: 'large',
      shape: 'circle'
    });
  }

  private isGoogleReady(): boolean {
    return typeof window.google !== 'undefined'
      && !!window.google.accounts
      && !!window.google.accounts.id;
  }

  // ==============================
  // CREDENTIAL HANDLING
  // ==============================
  private handleCredentialResponse(response: { credential?: string }): void {
    if (!response.credential) {
      this.error = 'No se recibió credencial de Google';
      this.loading = false;
      this.cdRef.detectChanges();
      return;
    }

    this.securityService
      .googleLogin(response.credential)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cartService.syncLocalCartToServer().subscribe({
            next: () => {
              this.loading = false;
              this.cdRef.detectChanges();
              this.router.navigate(['/']);
            },
            error: (error) => {
              this.loading = false;
              this.error = 'Signed in, but your cart could not be synced.';
              console.error('Error syncing guest cart after Google sign-in:', error);
              this.cdRef.detectChanges();
            },
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.error = this.mapError(error);
          this.cdRef.detectChanges();
        }
      });
  }

  private mapError(error: any): string {
    if (error.status === 401) return 'Token inválido o expirado';
    if (error.status === 400) return 'Error en la solicitud';
    if (error.status === 0) return 'No se pudo conectar con el servidor';
    return error.error?.message ?? error.error ?? 'Error al iniciar sesión';
  }
}