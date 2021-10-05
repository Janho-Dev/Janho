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

import * as Types from "../utils/Types"
import Janho from "../Janho"
import {Game} from "./Game"
import {Game4} from "./default/Game4"
import Prefabs from "../Prefabs"
import {Protocol} from "../protocol/Protocol"
const {ccclass, property} = cc._decorator

@ccclass
export class GameController extends cc.Component {
    private parent: Janho
    private mode: Types.game_mode
    anim = cc.repeatForever(cc.sequence(cc.delayTime(0.5), cc.fadeOut(1.0), cc.delayTime(0.5), cc.fadeIn(1.0)))

    @property(cc.Node)
    tehai: cc.Node = null
    @property(cc.Prefab)
    tsumohai: cc.Prefab = null
    @property(cc.Prefab)
    nakihai_node: cc.Prefab = null

    @property(cc.Node) sutehai: cc.Node = null
    @property(cc.Node) kamiSutehai: cc.Node = null
    @property(cc.Node) simoSutehai: cc.Node = null
    @property(cc.Node) toiSutehai: cc.Node = null

    @property(cc.Node) nakihai: cc.Node = null
    @property(cc.Node) kamiNakihai: cc.Node = null
    @property(cc.Node) simoNakihai: cc.Node = null
    @property(cc.Node) toiNakihai: cc.Node = null

    @property(cc.Label) timeLabel: cc.Label = null
    @property(cc.Label) amariLabel: cc.Label = null
    @property(cc.Label) kazeLabel: cc.Label = null
    @property(cc.Label) kamiKazeLabel: cc.Label = null
    @property(cc.Label) simoKazeLabel: cc.Label = null
    @property(cc.Label) toiKazeLabel: cc.Label = null

    @property(cc.Button) skipButton: cc.Button = null
    @property(cc.Button) chiButton: cc.Button = null
    @property(cc.Button) ponButton: cc.Button = null
    @property(cc.Button) kanButton: cc.Button = null
    @property(cc.Button) horaButton: cc.Button = null
    @property(cc.Label)  horaBtnLabel: cc.Label = null

    @property(cc.Button) testButton: cc.Button = null

    @property(cc.Prefab) resultTemp: cc.Prefab = null

    @property(cc.Label) nameLabel: cc.Label = null
    @property(cc.Label) kamiNameLabel: cc.Label = null
    @property(cc.Label) simoNameLabel: cc.Label = null
    @property(cc.Label) toiNameLabel: cc.Label = null

    @property(cc.Node) light: cc.Node = null
    @property(cc.Node) kamiLight: cc.Node = null
    @property(cc.Node) toiLight: cc.Node = null
    @property(cc.Node) simoLight: cc.Node = null

    @property
    game: Game = null

    public start(){
        //ここでparentとmodeが正しく初期化されていなければエラー
        this.parent.setGameController(this)
        if(this.mode === "4"){
            this.game = new Game4(this)
        }else{
            return
        }
        this.kazeLabel.string = "しばらくお待ち下さい"
        this.kazeLabel.node.runAction(this.anim)
        this.parent.getProtocol().emit("startRoom", {"protocol": "startRoom", "bool": true}, false)
        this.light.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.kamiLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.simoLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.toiLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.light.active = false
        this.kamiLight.active = false
        this.simoLight.active = false
        this.toiLight.active = false
    }
    public getGame(): Game{
        return this.game
    }

    public setParent(parent: Janho){
        this.parent = parent
    }
    public setMode(mode: Types.game_mode){
        this.mode = mode
    }
    public getPrefabs(): Prefabs{
        return this.parent.getPrefabs()
    }
    public getProtocol(): Protocol{
        return this.parent.getProtocol()
    }
    public getParent(): Janho{
        return this.parent
    }
}