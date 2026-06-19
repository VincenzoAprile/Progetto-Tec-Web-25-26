import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor() {}
  
  // Chiamata per registrare l'utente
  async registerUser(credentials: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Impossibile connettersi al server.' };
    }
  }

  // Chiamata per fare il login
  async loginUser(credentials: any): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        // IMPORTANTE: Dice al browser di accettare e salvare il cookie di sessione del server!
        credentials: 'include' 
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      return { success: true, username: data.username };
    } catch (error) {
      return { success: false, error: 'Impossibile connettersi al server.' };
    }
  }
}