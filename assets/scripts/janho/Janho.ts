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


import * as Prefabs from "./Prefabs"
import {Socket} from "./Socket"
import {Controller} from "./Controller"
import {Protocol} from "./protocol/Protocol"
import {GameController} from "./games/GameController"
import {Game} from "./games/Game"
import {RoomController} from "./room/RoomController"
const {ccclass, property} = cc._decorator

@ccclass
export default class Janho extends cc.Component {
    readonly VERSION = "ver 1.1.5"
    
    private controller: Controller
    private socket: Socket
    private network: Protocol
    private prefabs: Prefabs.default
    isConnected: boolean
    private vol: number = 0.5

    @property(cc.Node)
    MAIN_NODE: cc.Node = null
    @property(cc.Node)
    PREFABS: cc.Node = null

    @property(GameController)
    GAME_CONTROLLER: GameController = null
    @property(RoomController)
    ROOM_CONTROLLER: RoomController = null

    @property(cc.Prefab)
    particle: cc.Prefab = null

    @property(cc.Prefab)
    disconnect: cc.Prefab = null

    @property(cc.AudioClip)
    dahai1: cc.AudioClip = null
    @property(cc.AudioClip)
    dahai2: cc.AudioClip = null
    @property(cc.AudioClip)
    dahai3: cc.AudioClip = null
    @property(cc.AudioClip)
    furo1: cc.AudioClip = null
    @property(cc.AudioClip)
    furo2: cc.AudioClip = null
    @property(cc.AudioClip)
    furo3: cc.AudioClip = null
    @property(cc.AudioClip)
    click: cc.AudioClip = null
    @property(cc.AudioClip)
    noti: cc.AudioClip = null
    @property(cc.AudioClip)
    horaNoti: cc.AudioClip = null
    @property(cc.AudioClip)
    hora: cc.AudioClip = null

    @property(cc.SpriteFrame)
    Au050: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au000: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au025: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au075: cc.SpriteFrame = null

    @property(cc.SpriteFrame)
    Au050b: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au000b: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au025b: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    Au075b: cc.SpriteFrame = null

    @property(cc.Node)
    audio: cc.Node = null

    public onLoad(){
        this.isConnected = false
        this.prefabs = this.PREFABS.getComponent("Prefabs")
        this.controller = new Controller(this, this.MAIN_NODE, this.prefabs)
        this.socket = new Socket(this)
        this.network = new Protocol(this)

        console.log(`Loaded Janho ver ${this.VERSION}`)

        const self = this
        this.MAIN_NODE.on(cc.Node.EventType.TOUCH_START, function (event: any) { 
            self.createParticleme(event)
        }, this.node)

        this.audio.on(cc.Node.EventType.TOUCH_END, function () {
            self.changeVol()
        }, this.node)
    }

    public start(){
        this.controller.changeNode("title")
    }

    public emitData(data: string): void{
        this.socket.emit(data)
	}
    public onReceive(data: string): void{
		this.network.receive(data)
	}

    public setGameController(obj: GameController){
        this.GAME_CONTROLLER = obj
    }
    public deleteGameController(){
        //初期化?
        this.GAME_CONTROLLER = null
    }
    public getGameController(): GameController | null{
        return this.GAME_CONTROLLER
    }

    public setRoomController(obj: RoomController){
        this.ROOM_CONTROLLER = obj
    }
    public deleteRoomController(){
        //初期化?
        this.ROOM_CONTROLLER = null
    }
    public getRoomController(): RoomController | null{
        return this.ROOM_CONTROLLER
    }

    public getGame(): Game | null{
        if(this.GAME_CONTROLLER === null) return null
        return this.GAME_CONTROLLER.getGame()
    }
    public getSocket(): Socket{
        return this.socket
    }
    public getProtocol(): Protocol{
        return this.network
    }
    public getController(): Controller{
        return this.controller
    }
    public getPrefabs(): Prefabs.default{
        return this.prefabs
    }

    public createParticleme(event: any){
        const self = this
        var touches = event.getTouches()
        var touchLoc = touches[0].getLocation()
        var prefab = cc.instantiate(self.particle)
        self.node.addChild(prefab)
        var pos = prefab.convertToNodeSpaceAR(touchLoc)
        prefab.setPosition(pos)
    }

    public onDisconnect(): void{
        const dis = cc.instantiate(this.disconnect)
        dis.getChildByName("Button").on(cc.Node.EventType.TOUCH_END, () => {
            location.reload()
        }, this.node)
        this.node.addChild(dis)
    }

    public playSound(sound: string): void{
        let clip = null
        
        switch(sound){
            case "dahai1":
                clip = this.dahai1
                break
            case "dahai2":
                clip = this.dahai2
                break
            case "dahai3":
                clip = this.dahai3
                break
            case "furo1":
                clip = this.furo1
                break
            case "furo2":
                clip = this.furo2
                break
            case "furo3":
                clip = this.furo3
                break
            case "click":
                clip = this.click
                break
            case "noti":
                clip = this.noti
                break
            case "horaNoti":
                clip = this.horaNoti
                break
            case "hora":
                clip = this.hora
                break
        }

        if(clip !== null){
            const as = new cc.AudioSource()
            as.volume = this.vol
            as.clip = clip
            as.play()
        }
    }

    public changeVol(colOnly = false): void{
        let BW = "white"
        if(this.getController().getStatus() === "title") BW = "black" 

        if(colOnly){
            if(this.vol === 0.25){
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au025b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au025
            }else if(this.vol === 0.0){
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au000b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au000
            }else if(this.vol === 0.75){
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au075b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au075
            }else if(this.vol === 0.5){
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au050b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au050
            }
        }else{
            if(this.vol === 0.5){
                this.vol = 0.25
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au025b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au025
            }else if(this.vol === 0.25){
                this.vol = 0.0
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au000b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au000
            }else if(this.vol === 0.0){
                this.vol = 0.75
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au075b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au075
            }else if(this.vol === 0.75){
                this.vol = 0.5
                if(BW === "black") this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au050b
                else this.node.getChildByName("Audio Node").getComponent(cc.Sprite).spriteFrame = this.Au050
            }
        }
    }
}
