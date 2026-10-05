import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponseDTO, UserCredentialsDTO, UserDTO, UserInfo } from '../Models/Security/securityDTO';



@Injectable({
  providedIn: 'root'
})
export class SecurityService {


  // HttpClient used to communicate with the API
  private http = inject(HttpClient);

  // Base URL for User endpoints
  private urlBase = environment.apiURL + '/User';


  // LocalStorage keys
  private readonly tokenKey = 'token';
  private readonly expirationToken = 'token-expiration';
  private readonly userKey = 'user-info';


  // Stores the current user state
  private userSubject = new BehaviorSubject<UserInfo | null>(null);

  // Observable used by components to listen for user changes
  public user$ = this.userSubject.asObservable();


  constructor() { }



    getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.urlBase}/userList`);
  }

  // ==============================
  // REGISTER
  // ==============================

  // Register a new user
  register(credentials: UserCredentialsDTO): Observable<AuthResponseDTO> {

    // Send credentials to the API
    return this.http
      .post<AuthResponseDTO>(
        `${this.urlBase}/Sign-up`,
        credentials
      )

      // Run extra logic after receiving the response
      .pipe(

        // Save the token returned by the API
        tap(authenticationResponse =>
          this.saveToken(authenticationResponse)
        )
      );
  }



  // ==============================
  // LOGIN
  // ==============================

  // Login with email and password
  login(credentials: UserCredentialsDTO): Observable<AuthResponseDTO> {

    // Send login credentials to the API
    return this.http
      .post<AuthResponseDTO>(
        `${this.urlBase}/Login`,
        credentials
      )

      // Run extra logic after receiving the response
      .pipe(

        // Save the token after successful login
        tap(authenticationResponse =>
          this.saveToken(authenticationResponse)
        )
      );
  }



  // ==============================
  // TOKEN
  // ==============================

  // Get the JWT stored in LocalStorage
  getToken(): string | null {

    // Returns the token or null if it does not exist
    return localStorage.getItem(this.tokenKey);
  }



  // Save JWT and expiration date
  saveToken(authenticationResponse: AuthResponseDTO): void {

    // Save JWT
    localStorage.setItem(
      this.tokenKey,
      authenticationResponse.token
    );

    // Save token expiration date
    localStorage.setItem(
      this.expirationToken,
      authenticationResponse.expiration.toString()
    );
  }



  // ==============================
  // JWT CLAIMS
  // ==============================

  // Get a specific field from the JWT
  getJWTField(field: string): string {

    // Get token from LocalStorage
    const token = localStorage.getItem(this.tokenKey);


    // Stop if there is no token
    if (!token) {
      return '';
    }


    // JWT structure: header.payload.signature
    // [1] gets the payload
    // atob() decodes the Base64 payload
    // JSON.parse() converts it into an object
    const tokenData = JSON.parse(
      atob(token.split('.')[1])
    );


    // Get the requested field from the payload
    const value = tokenData[field];


    // Return empty string if field does not exist
    if (!value) {
      return '';
    }


    // If requesting email, return only text before @
    if (field === 'email') {

      return value.split('@')[0];
    }


    // Return the complete field value
    return value;
  }



  // Get a JWT field without modifying its value
  getJWTFieldForForm(field: string): string {

    // Get token from LocalStorage
    const token = localStorage.getItem(this.tokenKey);


    // Stop if there is no token
    if (!token) {
      return '';
    }


    // Decode the JWT payload
    const tokenData = JSON.parse(
      atob(token.split('.')[1])
    );


    // Get the requested field
    const value = tokenData[field];


    // Return empty string if field does not exist
    if (!value) {
      return '';
    }


    // Return the complete email
    if (field === 'email') {

      return value;
    }


    // Return the complete field value
    return value;
  }



  // ==============================
  // EMAIL
  // ==============================

  // Get the logged user's complete email
  getEmail(): string {

    // Get email from JWT or return "User"
    return this.getJWTFieldForForm('email') || 'User';
  }



  // ==============================
  // LOGIN STATUS
  // ==============================

  // Check if the user is currently logged in
  isLoggedIn(): boolean {

    // Get JWT
    const token = localStorage.getItem(this.tokenKey);


    // No token = not logged in
    if (!token) {
      return false;
    }


    // Get expiration date
    const expiration =
      localStorage.getItem(this.expirationToken);


    // No expiration = invalid login
    if (!expiration) {
      return false;
    }


    // Convert expiration string to Date
    const expirationDate = new Date(expiration);


    // Check if token already expired
    if (expirationDate <= new Date()) {

      // Clear login information
      this.logout();

      return false;
    }


    // Token exists and has not expired
    return true;
  }


 


  // ==============================
  // LOGOUT
  // ==============================

  // Logout the current user
  logout(): void {

    // Remove JWT
    localStorage.removeItem(this.tokenKey);

    // Remove expiration date
    localStorage.removeItem(this.expirationToken);

    // Remove stored user information
    localStorage.removeItem(this.userKey);


    // Tell subscribers there is no logged user
    this.userSubject.next(null);


    // Prevent Google from automatically selecting
    // the previous account after logout
    // if (typeof window.google !== 'undefined') {
    //   window.google.accounts.id.disableAutoSelect();
    // }
  }



  // ==============================
  // ROLES (RBAC: Admin, Booster, Client)
  // ==============================

  // Get the logged user's role from the JWT or local state
  getRole(): string {
    // Override manual para pruebas en modo desarrollo si existe
    const demoRole = localStorage.getItem('blackorder_active_role');
    if (demoRole) {
      return demoRole;
    }

    // Leer claims estándar de JWT
    const standardRole = this.getJWTField('role') || this.getJWTField('http://schemas.microsoft.com/ws/2008/06/identity/claims/role');
    if (standardRole) {
      return standardRole;
    }

    const admin = this.getJWTField('admin') || this.getJWTField('Admin');
    if (admin) return 'Admin';

    const booster = this.getJWTField('booster') || this.getJWTField('Booster');
    if (booster) return 'Booster';

    const client = this.getJWTField('client') || this.getJWTField('Client');
    if (client) return 'Client';

    // Por defecto en desarrollo para usuarios logueados o invitados
    return this.isLoggedIn() ? 'Client' : 'Booster'; // Permite explorar Booster Hub en demo
  }

  isBooster(): boolean {
    const role = this.getRole().toLowerCase();
    return role === 'booster' || role === 'admin';
  }

  isAdmin(): boolean {
    return this.getRole().toLowerCase() === 'admin';
  }

  isClient(): boolean {
    return this.getRole().toLowerCase() === 'client';
  }

  // Permite al usuario conmutar entre Cliente y Booster en la UI con 1 clic
  setRole(role: 'Admin' | 'Booster' | 'Client'): void {
    localStorage.setItem('blackorder_active_role', role);
  }

  getDiscordTag(): string {
    return this.getJWTField('DiscordTag') || localStorage.getItem('discord_tag') || '';
  }
}