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

import Janho from "../Janho"
const {ccclass, property} = cc._decorator

@ccclass
export class RoomController extends cc.Component {
    private parent: Janho
    isReady = false

    @property(cc.Label) p1_Label: cc.Label = null
    @property(cc.Label) p2_Label: cc.Label = null
    @property(cc.Label) p3_Label: cc.Label = null
    @property(cc.Label) p4_Label: cc.Label = null

    @property(cc.Label) p1r_Label: cc.Label = null
    @property(cc.Label) p2r_Label: cc.Label = null
    @property(cc.Label) p3r_Label: cc.Label = null
    @property(cc.Label) p4r_Label: cc.Label = null

    @property(cc.Label) btn_Label: cc.Label = null

    public start(){
        this.parent.setRoomController(this)
        this.parent.getProtocol().emit("getNumber", {"protocol": "getNumber"}, false)
        this.parent.getProtocol().emit("roomUpdate", {"protocol": "roomUpdate"}, false)
    }
    public setParent(parent: Janho){
        this.parent = parent
    }
    public setLabel(str: "準備" | "準備解除"){
        this.btn_Label.string = str
    }
    public setColor(n: number){
        if(n === 1){
            this.p1_Label.node.color = new cc.Color(223, 207, 31)
        }else if(n === 2){
            this.p2_Label.node.color = new cc.Color(223, 207, 31)
        }else if(n === 3){
            this.p3_Label.node.color = new cc.Color(223, 207, 31)
        }else if(n === 4){
            this.p4_Label.node.color = new cc.Color(223, 207, 31)
        }
    }

    public onRoomUpdate(json: string){
        const parsed = JSON.parse(json)
        if("data" in parsed){
            if(parsed["data"]["1"]["name"] !== null){
                this.p1_Label.string = parsed["data"]["1"]["name"]
                if(parsed["data"]["1"]["status"] === "ready") this.p1r_Label.string = "準備完了"
                else this.p1r_Label.string = ""
            }
            if(parsed["data"]["2"]["name"] !== null){
                this.p2_Label.string = parsed["data"]["2"]["name"]
                if(parsed["data"]["2"]["status"] === "ready") this.p2r_Label.string = "準備完了"
                else this.p2r_Label.string = ""
            }
            if(parsed["data"]["3"]["name"] !== null){
                this.p3_Label.string = parsed["data"]["3"]["name"]
                if(parsed["data"]["3"]["status"] === "ready") this.p3r_Label.string = "準備完了"
                else this.p3r_Label.string = ""
            }
            if(parsed["data"]["4"]["name"] !== null){
                this.p4_Label.string = parsed["data"]["4"]["name"]
                if(parsed["data"]["4"]["status"] === "ready") this.p4r_Label.string = "準備完了"
                else this.p4r_Label.string = ""
            }
        }
    }
}