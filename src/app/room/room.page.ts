import { Component, OnInit, ViewChild } from '@angular/core';
import { FactoryService } from '../communicators/factory.service';
import { CommunicationService } from '../communicators/communication-service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Message } from './message';
import { AudioPlayerService } from '../services/audio-player.service';
import { CanvasComponent } from './canvas/canvas.component';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit {

  @ViewChild('canvas') canvas: CanvasComponent;

  canvasWidth = 200;
  canvasHeight = 100;
  history: Message[] = [];
  communicator: CommunicationService;
  room: string;
  supportedColors = ['green', 'blue', 'orange', 'yellow', 'pink'];

  constructor(
    private factory: FactoryService,
    private route: ActivatedRoute,
    private ionicNavigator: NavController,
    private player: AudioPlayerService,
    private settings: SettingsService) { }

  ngOnInit() {
    this.communicator = this.factory.getCommunicator();
    this.room = this.route.snapshot.paramMap.get('id');
    this.communicator.join(this.room).catch(e => this.ionicNavigator.navigateRoot('/'));
    this.communicator.onClientJoin.subscribe(username => {
      this.history.push({ type: 'service', text: `Now entering [${this.room}]: ${username}` });
      this.player.playClientJoin();
    });
    this.communicator.onClientLeave.subscribe(username => {
      this.history.push({ type: 'service', text: `Now leaving: ${username}` });
      this.player.playClientLeave();
    });
    this.communicator.onMessage.subscribe(msg => {
      this.history.push({ type: 'normal', img: msg.img, user: msg.user });
      this.player.playClientMessage();
    });
  }

  // Canvas

  clearCanvas() {
    this.player.playDelete();
    this.canvas.resetCanvas();
  }

  copyCanvas() {
    this.player.playCopy();
    const img = new Image();
    img.onload = () => {
      this.canvas.cx.drawImage(img, 0, 0); // Or at whatever offset you like
    };
    img.src = this.history[this.history.length - 1].img;
  }

  sendCanvas() {
    this.communicator.sendMessage(this.canvas.canvasEl.toDataURL());
    this.player.playSend();
    this.history.push({ type: 'normal', img: this.canvas.canvasEl.toDataURL(), user: this.settings.username });
    this.canvas.resetCanvas();
  }

  // Canvas

  getColorForUserName(name: string) {
    return this.supportedColors[name.length % this.supportedColors.length];
  }

}
