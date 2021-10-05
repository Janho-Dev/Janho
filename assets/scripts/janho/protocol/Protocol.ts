/**
 *      _             _           
 *     | | __ _ _ __ | |__   ___  
 *  _  | |/ _` | '_ \| '_ \ / _ \ 
 * | |_| | (_| | | | | | | | (_) |
 *  \___/ \__,_|_| |_|_| |_|\___/ 
 *
 * This program is free software: you can redistribute it and/or modify 
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * @author Saisana299
 * @link https://github.com/Janho-Dev/Janho
 * 
 */

import * as Janho from "../Janho"
import {JanhoProtocol} from "./JanhoProtocol"

import {Register} from "./system/Register"
import {Timeout} from "./system/Timeout"
import {Timein} from "./system/Timein"

import {CreateRoom} from "./room/CreateRoom"
import {JoinRoom} from "./room/JoinRoom"
import {ReadyRoom} from "./room/ReadyRoom"
import {QuitRoom} from "./room/QuitRoom"
import {StartRoom} from "./room/StartRoom"

import {Kaikyoku} from "./game/Kaikyoku"
import {Haipai} from "./game/Haipai"
import {Tsumo} from "./game/Tsumo"
import {Dahai} from "./game/Dahai"
import {Hora} from "./game/Hora"
import {Kan} from "./game/Kan"
import {Kantsumo} from "./game/Kantsumo"
import {Ryukyoku} from "./game/Ryukyoku"
import {Shukyoku} from "./game/Shukyoku"
import {Skip} from "./game/Skip"
import {Candidate} from "./game/Candidate"
import {Chi} from "./game/Chi"
import {Pon} from "./game/Pon"
import {Ankan} from "./game/Ankan"
import {Kakan} from "./game/Kakan"
import {ResetRoom} from "./room/ResetRoom"
import { RoomUpdate } from "./room/RoomUpdate"
import { Trun } from "./game/Turn"

export class Protocol {
    private readonly parent: Janho.default
    private protocols: {[key: string]: JanhoProtocol} = {}
     isWait: boolean
     result: boolean | null

    constructor(parent: Janho.default){
        this.result = null
        this.parent = parent
        this.protocols = {
            "register": new Register(this.parent),
            "timeout": new Timeout(this.parent),
            "timein": new Timein(this.parent),

            "joinRoom": new JoinRoom(this.parent),
            "createRoom": new CreateRoom(this.parent),
            "readyRoom": new ReadyRoom(this.parent),
            "quitRoom": new QuitRoom(this.parent),
            "startRoom": new StartRoom(this.parent),
            "resetRoom": new ResetRoom(this.parent),
            "roomUpdate": new RoomUpdate(this.parent),

            "kaikyoku": new Kaikyoku(this.parent),
            "haipai": new Haipai(this.parent),
            "tsumo": new Tsumo(this.parent),
            "dahai": new Dahai(this.parent),
            "hora": new Hora(this.parent),
            "kan": new Kan(this.parent),
            "kantsumo": new Kantsumo(this.parent),
            "ryukyoku": new Ryukyoku(this.parent),
            "shukyoku": new Shukyoku(this.parent),
            "skip": new Skip(this.parent),
            "candidate": new Candidate(this.parent),
            "chi": new Chi(this.parent),
            "pon": new Pon(this.parent),
            "ankan": new Ankan(this.parent),
            "kakan": new Kakan(this.parent),
            "turn": new Trun(this.parent)
        }
    }

    /**
     * サーバーから受け取り
     * @param data JSON
     */
    public receive(data: string): void{
        const parsed = JSON.parse(data)
        if("protocol" in parsed){
            const protocol = this.getProtocol(parsed["protocol"])
            if(protocol !== null){
                if(this.isWait && this.result === null){
                    if("result" in parsed){
                        if(typeof parsed["result"] === "boolean"){
                            this.result = parsed["result"]
                        }else{
                            this.result = false
                        }
                    }
                }
                protocol.procReceive(data)
            }
        }
    }
    /**
     * サーバーへ送信
     * @param protocolName プロトコル名
     * @param json JSON
     */
    public emit(protocolName: string, json: {}, waiting: boolean = true): Promise<boolean> | null{
        if(this.isWait) return null
        const protocol = this.getProtocol(protocolName)
        if(protocol !== null){
            protocol.procEmit(json)
            if(waiting === false){
                this.isWait = false
                return null
            }
            this.isWait = true
            const self = this
            const wait = new Promise<boolean>((res, rej) => {
                async function loop(i: number){
                    const count = await new Promise<number>((resolve, reject) => {
                        setTimeout(() => {
                            if(self.result !== null){
                                if(self.result){
                                    self.isWait = false
                                    self.result = null
                                    res(true)
                                    return
                                }
                                else{
                                    self.isWait = false
                                    self.result = null
                                    res(false)
                                    return
                                }
                            }
                            resolve(i + 1)
                        }, 10)
                    })
                    if(self.isWait === false){
                        self.isWait = false
                        self.result = null
                        res(false)
                        return
                    }
                    if (count > 1000) {
                        self.isWait = false
                        self.result = null
                        res(false)
                        return
                    } else {
                        loop(count)
                    }
                }
                loop(0)
            })
            return wait
        }
        return null
    }

    /**
     * 指定したプロトコルインスタンス取得
     * @param protocol プロトコル名
     * @returns プロトコルインスタンス | null
     */
    private getProtocol(protocol: string): JanhoProtocol | null{
        if(protocol in this.protocols)
            return this.protocols[protocol]
        else
            return null
    }
}