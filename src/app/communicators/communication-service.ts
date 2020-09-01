import { Observable } from 'rxjs';

export interface CommunicationService {
    onError: Observable<string>;
    onRoomInfo: Observable<RoomInfo | RoomInfo[]>;
    onClientJoin: Observable<string>;
    onClientLeave: Observable<string>;
    onMessage: Observable<Message>;
    sendMessage(canvas: string): Promise<boolean>;
    connect(username: string): Promise<boolean>;
    join(room: string): Promise<boolean>;
    disconnect(username: string): Promise<boolean>;
}

export interface Message {
    user: string;
    img: string;
}

export interface RoomInfo {
    id: string;
    users: number;
}
