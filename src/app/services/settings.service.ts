import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  communicationType = 'ws';
  server = 'wss://apps.luismayo.com/pictochat/';
  username = 'test';
  logged = false;
  currentRoom: string = null;

  constructor() {
    const username = localStorage.getItem('username');
    if (username) {
      this.username = username;
    }
  }
}
