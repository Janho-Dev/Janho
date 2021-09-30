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

import {kaze_number} from "../../utils/Types";
import {Game} from "../Game"
import {GameController} from "../GameController";

export class Game4 implements Game {
    private readonly controller: GameController
    //ゲームステータス
    private timer: number | null
    private time: number | null
    private tehai: number[] | null
    private tsumohai: number | null
    private kaze: kaze_number | null

    constructor(contoroller: GameController){
        this.controller = contoroller
    }

    public onTimein(time: number): void {
        if(time <= 0 || time === null) return
        if(this.timer !== null) clearInterval(this.timer)
        this.time = time
        this.timer = setInterval(() => 
        {
            this.controller.timeLabel.string = `${this.time - 1}`
            this.time = this.time - 1;
            if(this.time === 0){
                this.clearButton()
                clearInterval(this.timer)
                this.time = null
                this.timer = null
                this.tsumohai = null
                this.controller.timeLabel.string = ""
                this.controller.tsumohai.getChildByName("Tsumohai").removeAllChildren()
            }
        }, 1000)
    }

    public onHaipai(kaze: kaze_number, hai: number[]): void {
        if(kaze === 0) this.controller.kazeLabel.string = "東"
        else if(kaze === 1) this.controller.kazeLabel.string = "南"
        else if(kaze === 2) this.controller.kazeLabel.string = "西"
        else if(kaze === 3) this.controller.kazeLabel.string = "北"
        this.kaze = kaze
        this.tehai = hai
        this.updateTehai(this.tehai)
    }

    public onTsumo(_hai: number): void {
        this.tsumohai = _hai
        this.controller.tsumohai.getChildByName("Tsumohai").removeAllChildren()
        const n = this.getHaiTempNum(_hai)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        const self = this
        const hai = _hai
        temp.on(cc.Node.EventType.TOUCH_END, () => {
            const result = self.controller.getProtocol().emit("dahai", {"protocol": "dahai", "hai": hai})
            if(result === null) return
            result.then((bool) => {
                if(bool){
                    self.clearTimer()
                    const s_n = self.getHaiTempNum(hai)
                    const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                    self.controller.sutehai.addChild(s_temp)
                }
            })
        })
        this.controller.tsumohai.getChildByName("Tsumohai").addChild(temp)
    }

    public onDahai(hai: number, kaze: kaze_number): void {
        let cha: "kami" | "simo" | "toi"
        switch(this.kaze){
            case 0:
                if(kaze === 1) cha = "kami"
                else if(kaze === 2) cha = "toi"
                else if(kaze === 3) cha = "simo"
                break;
            case 1:
                if(kaze === 0) cha = "simo"
                else if(kaze === 2) cha = "kami"
                else if(kaze === 3) cha = "toi"
                break;
            case 2:
                if(kaze === 1) cha = "simo"
                else if(kaze === 0) cha = "toi"
                else if(kaze === 3) cha = "kami"
                break;
            case 3:
                if(kaze === 1) cha = "toi"
                else if(kaze === 2) cha = "simo"
                else if(kaze === 0) cha = "kami"
                break;
        }
        const n = this.getHaiTempNum(hai)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        if(cha === "kami"){
            this.controller.kamiSutehai.addChild(temp)
        }else if(cha === "simo"){
            this.controller.simoSutehai.addChild(temp)
        }else if(cha === "toi"){
            this.controller.toiSutehai.addChild(temp)
        }
    }

    public onTimeout(json: string): void {
        const parsed = JSON.parse(json)
        if("protocol" in parsed){
            if(parsed["protocol"] === "dahai"){
                if("hai" in parsed){
                    if(typeof parsed["hai"] === "number"){
                        //ツモ牌と手牌を区別する必要がある
                        const n = this.getHaiTempNum(parsed["hai"])
                        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                        this.controller.sutehai.addChild(temp)
                    }
                }
            }
        }
    }

    public onCandidate(json: string): void{
        const parsed = JSON.parse(json)
        if(!("dahai" in parsed)){
            if("chi" in parsed || "pon" in parsed || "kan" in parsed || "hora" in parsed){
                this.controller.node.getChildByName("Skip Button").active = true
                const self = this
                this.controller.node.getChildByName("Skip Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("skip", {"protocol": "skip"})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }
        if("chi" in parsed){
            if("hai" in parsed["chi"] && "combi" in parsed["chi"]){
                this.controller.node.getChildByName("Chi Button").active = true
                const self = this
                this.controller.node.getChildByName("Chi Button").once(cc.Node.EventType.TOUCH_END, () => {
                    /*
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("chi", {"protocol": "chi", "hai": , "combi": })
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                    */
                }, this)
            }
        }
        if("pon" in parsed){
            if("hai" in parsed["pon"] && "combi" in parsed["pon"]){
                this.controller.node.getChildByName("Pon Button").active = true
                const self = this
                this.controller.node.getChildByName("Pon Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("pon", {"protocol": "pon", "hai": parsed["pon"]["hai"], "combi": parsed["pon"]["combi"]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            //鳴き処理
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }
        if("kan" in parsed){
            if("hai" in parsed["kan"] && "combi" in parsed["kan"]){
                this.controller.node.getChildByName("Kan Button").active = true
                const self = this
                this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("kan", {"protocol": "kan", "hai": parsed["kan"]["hai"], "combi": parsed["kan"]["combi"]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            //鳴き処理
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }else if("ankan" in parsed){
            if("hai" in parsed["ankan"] && "combi" in parsed["ankan"]){
                this.controller.node.getChildByName("Kan Button").active = true
                const self = this
                this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("ankan", {"protocol": "ankan", "hai": parsed["ankan"]["hai"], "combi": parsed["ankan"]["combi"]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            //鳴き処理
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }else if("kakan" in parsed){
            if("hai" in parsed["kakan"] && "combi" in parsed["kakan"]){
                this.controller.node.getChildByName("Kan Button").active = true
                const self = this
                this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.clearButton()
                    const result = self.controller.getProtocol().emit("kakan", {"protocol": "kakan", "hai": parsed["kakan"]["hai"], "combi": parsed["kakan"]["combi"]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            //鳴き処理
                            self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }
        if("hora" in parsed){
            if("dahai" in parsed){
                if("hai" in parsed["hora"]){
                    this.controller.horaBtnLabel.string = "ツモ"
                    this.controller.node.getChildByName("Hora Button").active = true
                    const self = this
                    this.controller.node.getChildByName("Hora Button").once(cc.Node.EventType.TOUCH_END, () => {
                        self.clearButton()
                        const result = self.controller.getProtocol().emit("hora", {"protocol": "hora", "hai": parsed["hora"]["hai"]})
                        if(result === null) return
                        result.then((bool) => {
                            if(bool){
                                //アガリ処理
                                self.clearTimer()
                            }else{
                                //err?
                            }
                        })
                    }, this)
                }
            }else{
                if("hai" in parsed["hora"]){
                    this.controller.horaBtnLabel.string = "ロン"
                    this.controller.node.getChildByName("Hora Button").active = true
                    const self = this
                    this.controller.node.getChildByName("Hora Button").once(cc.Node.EventType.TOUCH_END, () => {
                        self.clearButton()
                        const result = self.controller.getProtocol().emit("hora", {"protocol": "hora", "hai": parsed["hora"]["hai"]})
                        if(result === null) return
                        result.then((bool) => {
                            if(bool){
                                //アガリ処理
                                self.clearTimer()
                            }else{
                                //err?
                            }
                        })
                    }, this)
                }
            }
        }
    }

    public onChi(combi: number[], kaze: kaze_number): void {
        //
    }

    public onPon(combi: number[], kaze: kaze_number): void {
        //
    }

    public onKan(combi: number[], kaze: kaze_number): void {
        //
    }

    public onAnkan(combi: number[], kaze: kaze_number): void {
        //
    }

    public onKakan(combi: number[], kaze: kaze_number): void {
        //
    }

    private clearTimer(): void{
        if(this.timer !== null){
            this.clearButton()
            clearInterval(this.timer)
            this.time = null
            this.timer = null
            this.controller.timeLabel.string = ""
            this.controller.tsumohai.getChildByName("Tsumohai").removeAllChildren()
        }
    }

    private clearButton(): void{
        this.controller.node.getChildByName("Skip Button").active = false
        this.controller.node.getChildByName("Chi Button").active = false
        this.controller.node.getChildByName("Pon Button").active = false
        this.controller.node.getChildByName("Kan Button").active = false
        this.controller.node.getChildByName("Hora Button").active = false
        this.controller.horaBtnLabel.string = ""
    }

    private haiSort(hai: number[]): number[]{
        return hai.sort((a,b) => {return a - b})
    }

    private updateTehai(hai: number[]): void{
        let new_hai = this.haiSort(hai);
        for(var i = 0; i <= new_hai.length - 1; i++){
            const hai_s = Math.floor(new_hai[i] / 100) % 10;
            const hai_f = Math.floor(new_hai[i] / 1) % 10;
            const hai_n = hai_s * 10 + Math.floor(hai[i] / 10) % 10;
            if(hai_f){
                //
            }else{
                this.controller.tehai.getChildByName(`Tehai${i+1}`).removeAllChildren()
                const n = this.getHaiTempNum(new_hai[i])
                const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                const self = this
                const hai = new_hai[i]
                temp.on(cc.Node.EventType.TOUCH_END, () => {
                    const result = self.controller.getProtocol().emit("dahai", {"protocol": "dahai", "hai": hai})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.clearTimer()
                            self.tehai.push(self.tsumohai)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.updateTehai(self.tehai)

                            const s_n = self.getHaiTempNum(hai)
                            const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                            self.controller.sutehai.addChild(s_temp)
                        }
                    })
                })
                this.controller.tehai.getChildByName(`Tehai${i+1}`).addChild(temp)
            }
        }
    }

    private getHaiTempNum(i: number): number{
        const list = 
        {
            100: 0, 110: 1, 120: 2, 130: 3, 140: 4, 150: 5, 160: 6, 170: 7, 180: 8, 190: 9,
            200: 10, 210: 11, 220: 12, 230: 13, 240: 14, 250: 15, 260: 16, 270: 17, 280: 18, 290: 19,
            300: 20, 310: 21, 320: 22, 330: 23, 340: 24, 350: 25, 360: 26, 370: 27, 380: 28, 390: 29,
            410: 30, 420: 31, 430: 32, 440: 33, 450: 34, 460: 35, 470: 36
        }
        return list[i]
    }
}