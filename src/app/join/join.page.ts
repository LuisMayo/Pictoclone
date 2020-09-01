import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { FactoryService } from '../communicators/factory.service';
import { CommunicationService } from '../communicators/communication-service';

@Component({
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
})
export class JoinPage implements OnInit {

  communicator: CommunicationService;

  constructor(public settings: SettingsService, private factory: FactoryService) { }

  ngOnInit() {
    this.communicator = this.factory.getCommunicator();
  }

  login() {
    this.communicator.connect(this.settings.username).then(() => this.settings.logged = true);
  }

}
