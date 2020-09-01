import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {

  private clientJoin = new Audio('/assets/client_join.mp3');
  private clientLeave = new Audio('/assets/client_leave.mp3');
  private clientMessage = new Audio('/assets/client_message.mp3');
  private copy = new Audio('/assets/copy.mp3');
  private delete = new Audio('/assets/copy.mp3');
  private error = new Audio('/assets/error.mp3');
  private join = new Audio('/assets/join.mp3');
  private keydown = new Audio('/assets/keydown.mp3');
  private keyup = new Audio('/assets/keyup.mp3');
  private leave = new Audio('/assets/leave.mp3');
  private selectEraser = new Audio('/assets/select_eraser.mp3');
  private selectPen = new Audio('/assets/select_pen.mp3');
  private selectPenLarge = new Audio('/assets/select_pen_large.mp3');
  private selectPenSmall = new Audio('/assets/select_pen_small.mp3');
  private send = new Audio('/assets/send.mp3');

  constructor() { }
  playClientJoin() {
    this.clientJoin.play();
  }
  playClientLeave() {
    this.clientLeave.play();
  }
  playClientMessage() {
    this.clientMessage.play();
  }
  playCopy() {
    this.copy.play();
  }
  playDelete() {
    this.delete.play();
  }
  playError() {
    this.error.play();
  }
  playJoin() {
    this.join.play();
  }
  playKeydown() {
    this.keydown.play();
  }
  playKeyup() {
    this.keyup.play();
  }
  playLeave() {
    this.leave.play();
  }
  playSelectEraser() {
    this.selectEraser.play();
  }
  playSelectPen() {
    this.selectPen.play();
  }
  playSelectPenLarge() {
    this.selectPenLarge.play();
  }
  playSelectPenSmall() {
    this.selectPenSmall.play();
  }
  playSend() {
    this.send.play();
  }
}
