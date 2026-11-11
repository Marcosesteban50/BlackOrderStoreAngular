import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  AuthResponseDTO,
  UserCredentialsDTO,
  UserDTO,
  UserInfo,
  GoogleLoginRequestDTO,
  AuthResponseFullDTO,
  ContactDTO
} from '../Models/Security/securityDTO';
import { UserProfileDTO } from '../Models/Security/profileDTO';

type JwtPayload = {
  email?: string;
  nickName?: string;
  nickname?: string;
  userName?: string;
  unique_name?: string;
  Admin?: string;
  Seller?: string;
  Customer?: string;
  [key: string]: unknown;
};

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  private http = inject(HttpClient);

  private urlBase = environment.apiURL + '/User';
  private urlBasePerfil = environment.apiURL + '/Profile';

  // LocalStorage keys
  private readonly tokenKey = 'token';
  private readonly expirationToken = 'token-expiration';
  private readonly userKey = 'user-info';

  // Current user state
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // ==============================
  // PUBLIC API
  // ==============================
  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.urlBase}/UserList`);
  }

  sendEmail(contact: ContactDTO): Observable<any> {
    return this.http.post(`${this.urlBase}/SendEmail`, contact);
  }

  register(credentials: UserCredentialsDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<AuthResponseDTO>(`${this.urlBase}/Sign-up`, credentials)
      .pipe(tap(res => this.handleAuthResponse(res, credentials.nickName)));
  }

  login(credentials: UserCredentialsDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<AuthResponseDTO>(`${this.urlBase}/Login`, credentials)
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  googleLogin(idToken: string): Observable<AuthResponseFullDTO> {
    const request: GoogleLoginRequestDTO = { token: idToken };

    return this.http
      .post<AuthResponseFullDTO>(`${this.urlBase}/google-login`, request)
      .pipe(
        tap(res => {
          this.saveToken({ token: res.token, expiration: res.expiration });
          this.saveUserInfo(
            res.usuario?.email ?? this.getEmail(),
            res.usuario?.name,
            res.usuario?.nickName,
            res.usuario?.picture
          );
        })
      );
  }

  // ==============================
  // TOKEN MANAGEMENT
  // ==============================
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(auth: { token: string; expiration: Date | string }): void {
    localStorage.setItem(this.tokenKey, auth.token);
    localStorage.setItem(this.expirationToken, auth.expiration.toString());
  }

  // ==============================
  // AUTH RESPONSE HANDLING
  // ==============================
  private handleAuthResponse(res: AuthResponseDTO, nickName?: string): void {
    this.saveToken(res);
    this.saveUserInfo(
      res.usuario?.email ?? this.getEmail(),
      res.usuario?.name,
      res.usuario?.nickName ?? nickName,
      res.usuario?.picture
    );
  }

  // ==============================
  // USER INFO & STORAGE
  // ==============================
  private saveUserInfo(email: string, name?: string, nickName?: string, picture?: string): void {
    const tokenNickname = this.getNicknameFromToken();
    const resolvedNickname = nickName || tokenNickname || email.split('@')[0];
    const userInfo: UserInfo = {
      email,
      name: name || resolvedNickname,
      nickName: resolvedNickname,
      picture: picture ?? '',
      roles: this.getRolesFromToken()
    };

    localStorage.setItem(this.userKey, JSON.stringify(userInfo));
    this.userSubject.next(userInfo);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr) as UserInfo;
      this.userSubject.next(user);
    } catch {
      this.clearUserInfo();
    }
  }

  private clearUserInfo(): void {
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  // ==============================
  // JWT DECODING HELPERS
  // ==============================
  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      return JSON.parse(atob(parts[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  private getNicknameFromToken(): string | undefined {
    const payload = this.decodeToken();
    const nickname = payload?.nickName
      ?? payload?.nickname
      ?? payload?.userName
      ?? payload?.unique_name;

    return typeof nickname === 'string' ? nickname : undefined;
  }

  private getRolesFromToken(): string[] {
    const payload = this.decodeToken();
    if (!payload) return ['Customer'];

    const roles: string[] = [];
    if (payload.Admin === 'true') roles.push('Admin');
    if (payload.Seller === 'true') roles.push('Seller');
    if (payload.Customer === 'true') roles.push('Customer');

    return roles.length > 0 ? roles : ['Customer'];
  }

  // ==============================
  // PUBLIC GETTERS
  // ==============================
  getCurrentUser(): UserInfo | null {
    return this.userSubject.value;
  }

  getUserPicture(): string {
    const user = this.getCurrentUser();
    if (!user?.picture) return '';
    return user.picture.replace('=s96-c', '=s200');
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    if (user?.name) return user.name;
    return this.getEmail().split('@')[0] || 'User';
  }

  getUserNickname(): string {
    const user = this.getCurrentUser();
    if (user?.nickName) return user.nickName;
    return this.getEmail().split('@')[0] || 'User';
  }

  getEmail(): string {
    const payload = this.decodeToken();
    return payload?.email ?? '';
  }

  getJWTField(field: string): string {
    const payload = this.decodeToken();
    const value = payload?.[field];
    return typeof value === 'string' ? value : '';
  }

  // ==============================
  // LOGIN STATUS
  // ==============================
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expiration = localStorage.getItem(this.expirationToken);
    if (!expiration) return false;

    const expirationDate = new Date(expiration);
    if (expirationDate <= new Date()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  // ==============================
  // LOGOUT
  // ==============================
  logout(): void {
    this.clearSession();

    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expirationToken);
    this.clearUserInfo();
  }

  // ==============================
  // ROLES
  // ==============================
  getRoles(): string[] {
    const user = this.getCurrentUser();
    if (user?.roles?.length) return user.roles;
    return this.getRolesFromToken();
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getRole(): string {
    const roles = this.getRoles();
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Seller')) return 'Seller';
    if (roles.includes('Customer')) return 'Customer';
    return '';
  }

  isAdmin(): boolean { return this.hasRole('Admin'); }
  isSeller(): boolean { return this.hasRole('Seller'); }
  isCustomer(): boolean { return this.hasRole('Customer'); }




  getMyProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.urlBasePerfil}/GetMyProfile`);
  }


  updateProfile(profile: UserProfileDTO): Observable<UserProfileDTO> {
    return this.http.put<UserProfileDTO>(`${this.urlBasePerfil}/UpdateProfile`, profile);
  }


}