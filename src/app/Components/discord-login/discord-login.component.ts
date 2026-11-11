import { Component } from '@angular/core';

@Component({
  selector: 'app-discord-login',
  imports: [],
  templateUrl: './discord-login.component.html',
  styleUrl: './discord-login.component.css'
})
export class DiscordLoginComponent {
  private readonly clientId = 'YOUR_DISCORD_CLIENT_ID';

  loginWithDiscord(): void {
    if (this.clientId === 'YOUR_DISCORD_CLIENT_ID') {
      console.error('Configure the Discord OAuth2 client ID before logging in.');
      return;
    }

    const state = this.createState();
    sessionStorage.setItem('discord_oauth_state', state);

    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
      state
    });

    window.location.assign(`https://discord.com/oauth2/authorize?${params.toString()}`);
  }

  private createState(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
