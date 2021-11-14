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

import * as Janho from "../../Janho"
import {JanhoProtocol} from "../JanhoProtocol"

export class Richi implements JanhoProtocol {
    private readonly parent: Janho.default
    
    constructor(parent: Janho.default){
        this.parent = parent
    }

    public procReceive(data: string): void{
        const parsed = JSON.parse(data)
        if("protocol" in parsed){
            if(parsed["protocol"] === "richi"){
                if("hai" in parsed && "kaze" in parsed){
                    if(typeof parsed["hai"] === "number" && typeof parsed["kaze"] === "number"){
                        if(parsed["kaze"] === 0 || parsed["kaze"] === 1 || parsed["kaze"] === 2 || parsed["kaze"] === 3){
                            const game = this.parent.getGame()
                            if(game !== null) game.onRichi(parsed["hai"], parsed["kaze"])
                        }
                    }
                }
            }
        }
    }

    public procEmit(json: {}): void{
        const data = JSON.stringify(json)
        this.parent.emitData(data)
    }
}