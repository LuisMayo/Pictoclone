/**
 * Code taken from Tarik A
 * https://medium.com/@tarik.nzl/creating-a-canvas-component-with-free-hand-drawing-with-rxjs-and-angular-61279f577415
 * https://stackblitz.com/edit/angular-rxjs-canvas?file=src%2Fapp%2Fcanvas.component.ts
 */

import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 200;
  @Input() public height = 100;

  public cx: CanvasRenderingContext2D;
  public canvasEl: HTMLCanvasElement;

  public ngAfterViewInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.cx = this.canvasEl.getContext('2d');

    this.canvasEl.width = this.width;
    this.canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(this.canvasEl);
  }

  preventDefault(event: MouseEvent) {
      event.preventDefault();
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            );
        })
      )
      .subscribe((res: [MouseEvent | TouchEvent, MouseEvent | TouchEvent]) => {
        this.proccessMove(res)
      });

      fromEvent(canvasEl, 'touchstart')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'touchmove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(canvasEl, 'touchend')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'touchleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            );
        })
      )
      .subscribe((res: [MouseEvent | TouchEvent, MouseEvent | TouchEvent]) => {
        this.proccessMove(res)
      });
  }

    private proccessMove(res: [MouseEvent | TouchEvent, MouseEvent | TouchEvent]) {
        const rect = this.canvasEl.getBoundingClientRect();
        // previous and current position with the offset
        const points: [{clientX: number, clientY: number}, {clientX: number, clientY: number}] =
        res[0] instanceof MouseEvent ? (res as [MouseEvent, MouseEvent]) : [res[0].touches[0], (res[1] as TouchEvent).touches[0]];
        const prevPos = {
            x: points[0].clientX - rect.left,
            y: points[0].clientY - rect.top
        };
        const currentPos = {
            x: points[1].clientX - rect.left,
            y: points[1].clientY - rect.top
        };
        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
    }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

  public resetCanvas() {
    this.cx.fillStyle = 'white';
    this.cx.fillRect(0, 0, this.width, this.height);
  }
}
