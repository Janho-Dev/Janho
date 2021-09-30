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

/**
 * TODO
 * ・ボタンが残るバグ
 */

import * as Prefabs from "./Prefabs"
import {Socket} from "./Socket"
import {Controller} from "./Controller"
import {Protocol} from "./protocol/Protocol"
import {GameController} from "./games/GameController"
import {Game} from "./games/Game"
const {ccclass, property} = cc._decorator

@ccclass
export default class Janho extends cc.Component {
    private controller: Controller
    private socket: Socket
    private network: Protocol
    private prefabs: Prefabs.default
    isConnected: boolean

    @property(cc.Node)
    MAIN_NODE: cc.Node = null
    @property(cc.Node)
    PREFABS: cc.Node = null

    @property(GameController)
    GAME_CONTROLLER: GameController = null

    public onLoad(){
        this.isConnected = false
        this.prefabs = this.PREFABS.getComponent("Prefabs")
        this.controller = new Controller(this, this.MAIN_NODE, this.prefabs)
        this.socket = new Socket(this)
        this.network = new Protocol(this)
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
}
