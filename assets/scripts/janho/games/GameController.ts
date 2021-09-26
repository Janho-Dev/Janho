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
import { Protocol } from "../protocol/Protocol"
const {ccclass, property} = cc._decorator

@ccclass
export class GameController extends cc.Component {
    private parent: Janho
    private mode: Types.game_mode

    @property(cc.Node)
    tehai: cc.Node = null
    @property(cc.Node)
    tsumohai: cc.Node = null

    @property(cc.Node) sutehai: cc.Node = null
    @property(cc.Node) kamiSutehai: cc.Node = null
    @property(cc.Node) simoSutehai: cc.Node = null
    @property(cc.Node) toiSutehai: cc.Node = null

    @property(cc.Label) timeLabel: cc.Label = null
    @property(cc.Label) kazeLabel: cc.Label = null

    @property(cc.Button) skipButton: cc.Button = null

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
        this.parent.getProtocol().emit("startRoom", {"protocol": "startRoom", "bool": true}, false)
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
}