/**
 * Part of this component, as other parts of the app, were originally made by monowii: https://github.com/monowii/pictochat
 */

import { CommunicationService, RoomInfo, Message } from './communication-service';
import { Subject } from 'rxjs';
import { DeferredPromise } from '../deferred-promise';
import { SettingsService } from '../services/settings.service';

export class WebsocketService implements CommunicationService {
    static instance: WebsocketService;
    socket: WebSocket;
    onError: Subject<string> = new Subject();
    onRoomInfo: Subject<RoomInfo | RoomInfo[]> = new Subject();
    onClientJoin: Subject<string> = new Subject();
    onClientLeave: Subject<string> = new Subject();
    onMessage: Subject<Message> = new Subject();
    connectPromise: DeferredPromise<boolean>;
    joinPromise: DeferredPromise<boolean>;
    static getInstance(settings: SettingsService) {
        if (!this.instance) {
            this.instance = new WebsocketService(settings);
        }
        return this.instance;
    }

    constructor(private settings: SettingsService) {
        this.socket = new WebSocket(settings.server, 'pictochat-protocol');

        this.socket.onopen = (event) => {
            console.log('connection');
        };

        this.socket.onmessage = (message) => {
            const data = JSON.parse(message.data);

            switch (data.event) {
                case 'error':
                    this.onError.next('Generic error');
                    break;
                case 'rooms_info':
                    this.onRoomInfo.next([{id: 'A', users: data.rooms_info.A},
                        {id: 'B', users: data.rooms_info.B},
                        {id: 'C', users: data.rooms_info.C},
                        {id: 'D', users: data.rooms_info.D}
                    ]);
                    break;
                case 'check_username_success':
                    this.connectPromise.resolve(true);
                    break;
                case 'room_connection':
                    this.joinPromise.then(true);
                    break;
                case 'client_join':
                    this.onClientJoin.next(data.username);
                    break;
                case 'client_message':
                    this.onMessage.next({img: data.image, user: data.username});
                    break;
                case 'client_leave':
                    this.onClientLeave.next(data.username);
                    break;
            }
        };
    }
    join(room: string): Promise<boolean> {
        const username = localStorage.getItem('username');
        const data = {
            event: 'join',
            room,
            username: this.settings.username
        };
        this.socket.send(JSON.stringify(data));
        this.joinPromise = new DeferredPromise();
        return this.joinPromise;
    }
    sendMessage(canvas: string): Promise<boolean> {
        const data = {
            event: 'message',
            image: canvas
        };
        this.socket.send(JSON.stringify(data));
        // this.onMessage.next({user: this.settings.username, img: canvas});
        return Promise.resolve(true);
    }
    connect(username: string): Promise<boolean> {
        const checkUsername = {event: 'check_username', username};
        this.socket.send(JSON.stringify(checkUsername));
        this.connectPromise = new DeferredPromise();
        return this.connectPromise;
    }
    disconnect(username: string): Promise<boolean> {
        this.socket.close();
        return Promise.resolve(true);
    }
}
