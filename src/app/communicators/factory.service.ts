import { Injectable } from '@angular/core';
import { CommunicationService } from './communication-service';
import { WebsocketService } from './websocket-service';
import { SettingsService } from '../services/settings.service';
import { UdpService } from './udp-service';

@Injectable({
  providedIn: 'root'
})
export class FactoryService {

  constructor(private settings: SettingsService) { }

  getCommunicator(): CommunicationService {
    switch (this.settings.communicationType) {
      case 'ws':
      return WebsocketService.getInstance(this.settings);
      case 'udp':
      return UdpService.getInstance(this.settings);
    }
  }
}
