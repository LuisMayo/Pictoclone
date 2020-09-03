import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
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
export class RoomPage implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('canvas') canvas: CanvasComponent;
  @ViewChild('canvasLetters') canvasLetters: CanvasComponent;
  @ViewChild('hiddenInput') hiddenInput: ElementRef<HTMLInputElement>;
  @ViewChild('bottom') bottom: ElementRef<HTMLDivElement>;

  canvasWidth = 350;
  canvasHeight = 100;
  writtenText = '';
  history: Message[] = [];
  communicator: CommunicationService;
  room: string;
  supportedColors = ['green', 'blue', 'orange', 'yellow', 'pink'];
  needScroll = false;

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
      this.needScroll = true;
      this.player.playClientMessage();
    });
  }

  ngAfterViewInit() {
    this.clearCanvas();
  }

  ngAfterViewChecked() {
    if (this.needScroll) {
      this.bottom.nativeElement.scrollIntoView();
      this.needScroll = false;
    }
    this.hiddenInput.nativeElement.focus();
  }

  // Canvas

  btnClearCanvas() {
    this.player.playDelete();
    this.clearCanvas();
  }

  clearCanvas() {
    this.canvas.resetCanvas();
    this.canvasLetters.resetCanvas();
    this.writtenText = '';
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
    this.canvas.cx.drawImage(this.canvasLetters.canvasEl, 0 , 0);
    this.communicator.sendMessage(this.canvas.canvasEl.toDataURL());
    this.player.playSend();
    this.history.push({ type: 'normal', img: this.canvas.canvasEl.toDataURL(), user: this.settings.username });
    this.clearCanvas();
  }

  // Canvas

  getColorForUserName(name: string) {
    return this.supportedColors[name.length % this.supportedColors.length];
  }

  typeTextIntoCanvas() {
    this.canvasLetters.resetCanvas();
    // let text = this.writtenText.substring(0, Math.min(5, this.writtenText.length));
    // for (let i = 5; i < this.writtenText.length; i += 5) {
    //   text += '\n' + this.writtenText.substring(i, Math.min(i + 5, this.writtenText.length));
    // }
    this.canvasLetters.cx.fillText(this.writtenText, 0, 20);
  }

}
