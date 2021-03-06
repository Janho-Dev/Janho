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

import * as Types from "./utils/Types"
import Janho from "./Janho"
import Prefabs from "./Prefabs"
import {GameController} from "./games/GameController"
import {RoomController} from "./room/RoomController"

export class Controller {
    private readonly parent: Janho
    private readonly node: cc.Node
    private readonly prefabs: Prefabs
    private status: Types.janho_node
    private name: string = null

    constructor(parent: Janho, node: cc.Node, prefabs: Prefabs){
        this.parent = parent
        this.node = node
        this.prefabs = prefabs
    }

    public getStatus(): Types.janho_node{
        return this.status
    }

    public changeNode(type: Types.janho_node, args: any = null){
        if(type === "title") this.setTitle()
        else if(type === "home") this.setHome()
        else if(type === "room") this.setRoom()
        else if(type === "game") this.setGame()
        this.parent.changeVol(true)
    }

    /**
     * タイトル画面
     */
    private setTitle(){
        this.node.removeAllChildren()
        const title = cc.instantiate(this.prefabs.TITLE_TEMP)
        const self = this
        title.getChildByName("Version Label").getComponent(cc.Label).string = this.parent.VERSION
        title.getChildByName("Play Button").on(cc.Node.EventType.TOUCH_END, () => {
            self.parent.playSound("click")
            if(!(self.parent.isConnected)){
                const err = cc.instantiate(self.prefabs.TITLE_ERROR)
                const old = title.getChildByName("Title Error Temp")
                if(old !== null){
                    title.removeChild(old)
                }
                err.getChildByName("Error Label").getComponent(cc.Label).string = "Error: サーバーに接続できませんでした"
                title.addChild(err)
                return
            }
            self.changeNode("home")
        }, this)
        title.getChildByName("GitHub-Mark-64px").on(cc.Node.EventType.TOUCH_END, () => {
            window.open("https://github.com/Janho-Dev/Janho", "_blank")
        }, this)
        this.status = "title"
        this.node.addChild(title)
    }

    /**
     * ホーム画面
     */
    private setHome(){
        this.node.removeAllChildren()
        const home = cc.instantiate(this.prefabs.HOME_TEMP)
        const self = this
        if(this.name !== null){
            home.getChildByName("User EBox").getComponent(cc.EditBox).placeholder = this.name
            home.getChildByName("User EBox").getChildByName("TEXT_LABEL").getComponent(cc.Label).enabled = false
            home.getChildByName("User EBox").getComponent(cc.EditBox).enabled = false
        }
        home.getChildByName("Game4 Button").on(cc.Node.EventType.TOUCH_END, () => {
            self.parent.playSound("click")
            if(this.name === null){
                const userId = home.getChildByName("User EBox").getComponent(cc.EditBox).string
                const roomId = home.getChildByName("Room EBox").getComponent(cc.EditBox).string
                if(userId === "" || roomId === "") return
                const register = self.parent.getProtocol().emit("register", {"protocol": "register", "name": userId})
                if(register === null) return
                register.then((bool) => {
                    if(!bool){
                        const err = cc.instantiate(self.prefabs.TITLE_ERROR)
                        const old = home.getChildByName("Title Error Temp")
                        if(old !== null){
                            home.removeChild(old)
                        }
                        err.getChildByName("Error Label").getComponent(cc.Label).string = "Error: 名前を登録できませんでした"
                        err.getChildByName("Error Label").color = new cc.Color(255, 255, 255)
                        home.addChild(err)
                        return
                    }
                    else {
                        self.name = userId
                        const joinRoom = self.parent.getProtocol().emit("joinRoom", {"protocol": "joinRoom", "roomId": roomId})
                        if(joinRoom === null) return
                        joinRoom.then((bool) => {
                            if(bool){
                                self.changeNode("room")
                            }else{
                                const createRoom = self.parent.getProtocol().emit("createRoom", {"protocol": "createRoom", "roomId": roomId})
                                if(createRoom === null) return
                                createRoom.then((bool) => {
                                    if(!bool){
                                        const err = cc.instantiate(self.prefabs.TITLE_ERROR)
                                        const old = home.getChildByName("Title Error Temp")
                                        if(old !== null){
                                            home.removeChild(old)
                                        }
                                        err.getChildByName("Error Label").getComponent(cc.Label).string = "Error: 部屋に参加できませんでした"
                                        err.getChildByName("Error Label").color = new cc.Color(255, 255, 255)
                                        home.addChild(err)
                                        return
                                    }
                                    self.changeNode("room")
                                })
                            }
                        })
                    }
                })
            }else{
                const roomId = home.getChildByName("Room EBox").getComponent(cc.EditBox).string
                if(roomId === "") return
                const joinRoom = self.parent.getProtocol().emit("joinRoom", {"protocol": "joinRoom", "roomId": roomId})
                if(joinRoom === null) return
                joinRoom.then((bool) => {
                    if(bool){
                        self.changeNode("room")
                    }else{
                        const createRoom = self.parent.getProtocol().emit("createRoom", {"protocol": "createRoom", "roomId": roomId})
                        if(createRoom === null) return
                        createRoom.then((bool) => {
                            if(!bool){
                                const err = cc.instantiate(self.prefabs.TITLE_ERROR)
                                const old = home.getChildByName("Title Error Temp")
                                if(old !== null){
                                    home.removeChild(old)
                                }
                                err.getChildByName("Error Label").getComponent(cc.Label).string = "Error: 部屋に参加できませんでした"
                                err.getChildByName("Error Label").color = new cc.Color(255, 255, 255)
                                home.addChild(err)
                                return
                            }
                            self.changeNode("room")
                        })
                    }
                })
            }
        }, this)

        home.getChildByName("Exit Button").on(cc.Node.EventType.TOUCH_END, () => {
            location.reload()
        })
        this.status = "home"
        this.node.addChild(home)
    }

    /**
     * ルーム画面
     */
    private setRoom(){
        this.node.removeAllChildren()
        const room = cc.instantiate(this.prefabs.ROOM_TEMP)
        const self = this
        const roomC: RoomController = room.getComponent("RoomController")
        roomC.setLabel("準備")
        room.getChildByName("Ready Button").on(cc.Node.EventType.TOUCH_END, () => {
            self.parent.playSound("click")
            if(!roomC.isReady){
                self.parent.getProtocol().emit("readyRoom", {"protocol": "readyRoom", "bool": true}, false)
                roomC.isReady = true
                roomC.setLabel("準備解除")
            }else{
                self.parent.getProtocol().emit("readyRoom", {"protocol": "readyRoom", "bool": false}, false)
                roomC.isReady = false
                roomC.setLabel("準備")
            }
        }, this)
        room.getChildByName("AddAI Button").on(cc.Node.EventType.TOUCH_END, () => {
            self.parent.playSound("click")
            self.parent.getProtocol().emit("addAI", {"protocol": "addAI"}, false)
        }, this)
        roomC.setParent(this.parent)
        room.getChildByName("Exit Button").on(cc.Node.EventType.TOUCH_END, () => {
            const result = self.parent.getProtocol().emit("quitRoom", {"protocol": "quitRoom"})
            if(result === null) return
            result.then((bool) => {
                if(bool){
                    self.changeNode("home")
                }
            })
        }, this)

        this.status = "room"
        this.node.addChild(room)
    }

    /**
     * ゲーム画面
     */
    private setGame(){
        this.node.removeAllChildren()
        const game = cc.instantiate(this.prefabs.GAME_TEMP)
        const gameC: GameController = game.getComponent("GameController")
        gameC.setParent(this.parent)
        gameC.setMode("4")
        this.status = "game"
        this.node.addChild(game)
    }
}
