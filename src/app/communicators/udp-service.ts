import { CommunicationService, Message, RoomInfo } from './communication-service';
import { Subject } from 'rxjs';
import { SettingsService } from '../services/settings.service';
import { Plugins } from '@capacitor/core';
import { IUdpPlugin } from 'capacitor-udp/dist/esm/definitions';
const { UdpPlugin } = Plugins;

/*
    TODO LMAYO send username too becuase we can't differenciate people otherwise
    Check other user doesn't have the same username
*/

export class UdpService implements CommunicationService {
    static instance: UdpService;
    onError: Subject<string>;
    onRoomInfo: Subject<RoomInfo | RoomInfo[]>;
    onClientJoin: Subject<string>;
    onClientLeave: Subject<string>;
    onMessage: Subject<Message>;
    beaconInterval: NodeJS.Timeout;

    socketId: number;
    clientsMap: Map<string, {user: string, lastSeen: number}[]> = new Map();
    static getInstance(settings: SettingsService) {
        if (!this.instance) {
            this.instance = new UdpService(settings);
        }
        return this.instance;
    }

    constructor(private settings: SettingsService) {
        this.addAllHandlers();
    }

    addAllHandlers() {
        UdpPlugin.addListener('receive', data => {
            const payload = JSON.parse(data.buffer);
            if (!this.clientsMap.has(payload.room)) {
                this.clientsMap.set(payload.room, []);
            }
            const clients = this.clientsMap.get(payload.room);
            const client = clients.find(item => item.user === payload.username) || {user: payload.username, lastSeen: null};
            client.lastSeen = Date.now();
            this.onRoomInfo.next({id: payload.room, users: clients.length});
            if (payload.room === this.settings.currentRoom) {
                this.onMessage.next({img: payload.img, user: payload.username});
            }
        });
    }

    async sendMessage(canvas: string): Promise<boolean> {
        try {
            const payload = JSON.stringify({room: this.settings.currentRoom, username: this.settings.username, img: canvas});
            await UdpPlugin.send({address: '255.255.255.255', port: 19321, buffer: payload, socketId: this.socketId});
            return true;
        } catch {
            return false;
        }
    }
    async connect(username: string): Promise<boolean> {
        try {
            this.socketId = (await UdpPlugin.create({properties: { name: 'pictoSocket', bufferSize: 32768 }})).socketId;
            return true;
        } catch (e) {
            return false;
        }
    }
    async join(room: string): Promise<boolean> {
        this.beaconInterval = setInterval(() => {
            const payload = JSON.stringify({room: this.settings.currentRoom, username: this.settings.username});
            UdpPlugin.send({address: '255.255.255.255', port: 19321, buffer: payload, socketId: this.socketId});
        }, 500);
        try {
            await UdpPlugin.bind({address: '0.0.0.0', port: 19321, socketId: this.socketId});
            return true;
        } catch (e) {
            return false;
        }
    }
    async disconnect(username: string): Promise<boolean> {
        clearInterval(this.beaconInterval);
        try {
            await UdpPlugin.closeAllSockets();
            return true;
        } catch (e) {
            return false;
        }
    }
}
