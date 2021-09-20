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
 * @link https://github.com/Janho-Dev/Janho-Server
 * 
 */

import Janho from "../Janho"
const {ccclass, property} = cc._decorator

@ccclass
export class GameController extends cc.Component {
    private parent: Janho

    @property(cc.Node)
    tehai: cc.Node = null;

    @property(cc.Node)
    tsumohai: cc.Node = null;

    public onLoad(){
    }

    public start(){
        this.parent.getProtocol().emit("startRoom", {"protocol": "startRoom", "bool": true})
    }

    public setParent(parent: Janho){
        this.parent = parent
    }
}