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
 * ・チー実装
 * ・リーチ実装
 * ・流局からの点数移動
 * 
 * ・重複部分のリファクタリング
 */

import {kaze_number, ryukyoku} from "../../utils/Types";
import {Game} from "../Game"
import {GameController} from "../GameController";

export class Game4 implements Game {
    private readonly controller: GameController
    //ゲームステータス
    private timer: number | null
    private timer_id: number = 0
    private time: number | null
    private tehai: number[] | null
    private tsumohai_cache: number
    private isTsumo: boolean = false
    private preRichi: boolean = false
    private kaze: kaze_number | null
    private furo: {[key in kaze_number]: number[][]} = {0:[],1:[],2:[],3:[]}
    private dahai_cache: {"kaze": kaze_number, "uuid": string, "anim": cc.ActionInterval} 
    = {"kaze": null, "uuid": null, "anim": null}

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
                this.clearSutehai()
                clearInterval(this.timer)
                this.time = null
                this.timer = null
                this.controller.timeLabel.string = ""
                const tp = this.controller.tehai.getChildByName("Tsumo Node Temp")
                this.controller.tehai.removeChild(tp)

                this.updateTehai(this.tehai)
            }
        }, 1000)
        this.timer_id = this.timer_id + 1
    }

    public onHaipai(kaze: kaze_number, hai: number[], dora: number, names: {[key in kaze_number]: string}): void {
        this.controller.amariLabel.node.stopAction(this.controller.anim)
        this.controller.amariLabel.node.opacity = 255
        if(kaze === 0){
            this.controller.kazeLabel.string = "東"
            this.controller.kazeLabel.node.color = cc.color(255, 100, 100, 255)
            this.controller.kamiKazeLabel.string = "南"
            this.controller.simoKazeLabel.string = "北"
            this.controller.toiKazeLabel.string = "西"
        }
        else if(kaze === 1){
            this.controller.kazeLabel.string = "南"
            this.controller.kamiKazeLabel.string = "西"
            this.controller.simoKazeLabel.string = "東"
            this.controller.simoKazeLabel.node.color = cc.color(255, 100, 100, 255)
            this.controller.toiKazeLabel.string = "北"
        }
        else if(kaze === 2){
            this.controller.kazeLabel.string = "西"
            this.controller.kamiKazeLabel.string = "北"
            this.controller.simoKazeLabel.string = "南"
            this.controller.toiKazeLabel.string = "東"
            this.controller.toiKazeLabel.node.color = cc.color(255, 100, 100, 255)
        }
        else if(kaze === 3){
            this.controller.kazeLabel.string = "北"
            this.controller.kamiKazeLabel.string = "東"
            this.controller.kamiKazeLabel.node.color = cc.color(255, 100, 100, 255)
            this.controller.simoKazeLabel.string = "西"
            this.controller.toiKazeLabel.string = "南"
        }
        this.kaze = kaze
        this.tehai = hai
        this.updateTehai(this.tehai)

        const n = this.getHaiTempNum(dora)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        this.controller.doraNode.getChildByName("Dora Node").addChild(temp)
        for(let i = 1; i < 5; i++){
            const p = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[this.getHaiTempNum(500)])
            this.controller.doraNode.getChildByName("Dora Node").addChild(p)
        }

        const kz: kaze_number[] = [0,1,2,3]
        for(let k of kz){
            if(k === kaze){
                this.controller.nameLabel.string = names[k]
                continue
            }
            const cha = this.getCha(k)
            if(cha === "kami") this.controller.kamiNameLabel.string = names[k]
            else if(cha === "simo") this.controller.simoNameLabel.string = names[k]
            else if(cha === "toi") this.controller.toiNameLabel.string = names[k]
        }
    }

    public onTurn(kaze: kaze_number, n: number): void{
        this.controller.light.active = false
        this.controller.kamiLight.active = false
        this.controller.simoLight.active = false
        this.controller.toiLight.active = false
        if(kaze === this.kaze){
            this.controller.light.opacity = 255
            this.controller.light.active = true
        }else{
            const cha = this.getCha(kaze)
            if(cha === "kami"){
                this.controller.kamiLight.opacity = 255
                this.controller.kamiLight.active = true
            }else if(cha === "simo"){
                this.controller.simoLight.opacity = 255
                this.controller.simoLight.active = true
            }else if(cha === "toi"){
                this.controller.toiLight.opacity = 255
                this.controller.toiLight.active = true
            }
        }
        this.controller.amariLabel.string = `余 ${n}`
    }

    public onTsumo(_hai: number): void {
        this.tsumohai_cache = _hai
        this.isTsumo = true
        const tp = this.controller.tehai.getChildByName("Tsumo Node Temp")
        this.controller.tehai.removeChild(tp)
        const n = this.getHaiTempNum(_hai)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        const self = this
        const hai = _hai
        temp.on(cc.Node.EventType.TOUCH_END, () => {
            if(self.preRichi) return
            const result = self.controller.getProtocol().emit("dahai", {"protocol": "dahai", "hai": hai})
            if(result === null) return
            result.then((bool) => {
                if(bool){
                    self.clearTimer()
                    const s_n = self.getHaiTempNum(hai)
                    const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                    self.controller.sutehai.addChild(s_temp)
                    self.dahai_cache["kaze"] = self.kaze
                    self.dahai_cache["uuid"] = s_temp.uuid
                    self.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
                    self.isTsumo = false

                    self.updateTehai(self.tehai)
                }
            })
        })
        const t_tmp = cc.instantiate(this.controller.tsumohai)
        this.controller.tehai.addChild(t_tmp)
        this.controller.tehai.getChildByName("Tsumo Node Temp").addChild(temp)
    }

    public onDahai(hai: number, kaze: kaze_number, isRichi: boolean = false): void {
        const cha = this.getCha(kaze)
        const n = this.getHaiTempNum(hai)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        if(isRichi) temp.rotation = 90

        if(this.dahai_cache["kaze"] !== null){
            const p_cha = this.getCha(this.dahai_cache["kaze"])
            let p_hai = null
            if(p_cha === "kami"){
                p_hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            }else if(p_cha === "simo"){
                p_hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
            }else if(p_cha === "toi"){
                p_hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])  
            }
            if(p_hai !== null){
                const tag_id = this.dahai_cache["anim"].getTag()
                if(tag_id !== -1){
                    if(p_hai.getActionByTag(tag_id) !== null)
                    p_hai.stopAction(this.dahai_cache["anim"])
                    p_hai.opacity = 255
                }
            }
        }

        this.dahai_cache["kaze"] = kaze
        this.dahai_cache["uuid"] = temp.uuid
        this.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
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
                    const old_id = self.timer_id
                    self.clearButton()
                    self.clearSutehai()
                    const result = self.controller.getProtocol().emit("skip", {"protocol": "skip"})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            if(old_id === self.timer_id) self.clearTimer()
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }
        if("chi" in parsed){
            if("hai" in parsed["chi"] && "combi" in parsed["chi"] && "from" in parsed["chi"]){
                this.controller.node.getChildByName("Chi Button").active = true
                const self = this

                const kz = this.getCha(parsed["chi"]["from"])
                if(kz === "kami"){
                    const hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "simo"){
                    const hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "toi"){
                    const hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }

                this.controller.node.getChildByName("Chi Button").once(cc.Node.EventType.TOUCH_END, () => {
                    // {"protocol":"candidate","data":{"chi":{"hai":[210],"combi":[[210,220,230]],"from":0}}}
                    //コンビ数確認→1つ：続行→２つ以上：選択画面表示
                    /*
                    const old_id = self.timer_id
                    self.clearButton()
                    const hai: number = parsed["pon"]["hai"][0]
                    const result = self.controller.getProtocol().emit("pon", {"protocol": "pon", "hai": hai, "combi": [hai,hai,hai]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.controller.logoNode.opacity = 0
                            const logo = cc.instantiate(self.controller.ponLogo)
                            self.controller.logoNode.addChild(logo)
                            self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                            const clear = () => {
                                self.controller.logoNode.removeAllChildren()
                            }
                            setTimeout(clear, 2000)

                            const kz = self.getCha(parsed["pon"]["from"])
                            if(kz === "kami"){
                                const c = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.kamiSutehai.removeChild(c)
                            }else if(kz === "simo"){
                                const c = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.simoSutehai.removeChild(c)
                            }else if(kz === "toi"){
                                const c = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.toiSutehai.removeChild(c)
                            }

                            if(old_id === self.timer_id) self.clearTimer()
                            self.furo[self.kaze].push([hai,hai,hai])
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.updateTehai(self.tehai)
                            self.updateNakihai(self.furo[self.kaze], self.kaze)
                        }else{
                            //err?
                        }
                    })
                    */
                }, this)
            }
        }
        if("pon" in parsed){
            if("hai" in parsed["pon"] && "combi" in parsed["pon"] && "from" in parsed["pon"]){
                this.controller.node.getChildByName("Pon Button").active = true
                const self = this

                const kz = this.getCha(parsed["pon"]["from"])
                if(kz === "kami"){
                    const hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "simo"){
                    const hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "toi"){
                    const hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }

                this.controller.node.getChildByName("Pon Button").once(cc.Node.EventType.TOUCH_END, () => {
                    const old_id = self.timer_id
                    self.clearButton()
                    const hai: number = parsed["pon"]["hai"][0]
                    const result = self.controller.getProtocol().emit("pon", {"protocol": "pon", "hai": hai, "combi": [hai,hai,hai]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.controller.logoNode.opacity = 0
                            const logo = cc.instantiate(self.controller.ponLogo)
                            self.controller.logoNode.addChild(logo)
                            self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                            const clear = () => {
                                self.controller.logoNode.removeAllChildren()
                            }
                            setTimeout(clear, 2000)

                            const kz = self.getCha(parsed["pon"]["from"])
                            if(kz === "kami"){
                                const c = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.kamiSutehai.removeChild(c)
                            }else if(kz === "simo"){
                                const c = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.simoSutehai.removeChild(c)
                            }else if(kz === "toi"){
                                const c = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.toiSutehai.removeChild(c)
                            }

                            if(old_id === self.timer_id) self.clearTimer()
                            self.furo[self.kaze].push([hai,hai,hai])
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.updateTehai(self.tehai)
                            self.updateNakihai(self.furo[self.kaze], self.kaze)
                        }else{
                            //err?
                        }
                    })
                }, this)
            }
        }
        if("kan" in parsed){
            if("hai" in parsed["kan"] && "combi" in parsed["kan"] && "from" in parsed["kan"]){
                this.controller.node.getChildByName("Kan Button").active = true
                const self = this

                const kz = this.getCha(parsed["kan"]["from"])
                if(kz === "kami"){
                    const hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "simo"){
                    const hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }else if(kz === "toi"){
                    const hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                    hai.runAction(this.dahai_cache["anim"])
                }

                this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                    const old_id = self.timer_id
                    self.clearButton()
                    const hai: number = parsed["kan"]["hai"][0]
                    const result = self.controller.getProtocol().emit("kan", {"protocol": "kan", "hai": hai, "combi": [hai,hai,hai,hai]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.controller.logoNode.opacity = 0
                            const logo = cc.instantiate(self.controller.kanLogo)
                            self.controller.logoNode.addChild(logo)
                            self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                            const clear = () => {
                                self.controller.logoNode.removeAllChildren()
                            }
                            setTimeout(clear, 2000)

                            const kz = self.getCha(parsed["pon"]["from"])
                            if(kz === "kami"){
                                const c = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.kamiSutehai.removeChild(c)
                            }else if(kz === "simo"){
                                const c = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.simoSutehai.removeChild(c)
                            }else if(kz === "toi"){
                                const c = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                self.controller.toiSutehai.removeChild(c)
                            }

                            if(old_id === self.timer_id) self.clearTimer()
                            self.furo[self.kaze].push([hai,hai,hai,hai])
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.updateTehai(self.tehai)
                            self.updateNakihai(self.furo[self.kaze], self.kaze)
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
                    const old_id = self.timer_id
                    self.clearButton()
                    const hai: number = parsed["ankan"]["hai"][0]
                    const result = self.controller.getProtocol().emit("ankan", {"protocol": "ankan", "hai": hai, "combi": [hai,hai,hai,hai]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.controller.logoNode.opacity = 0
                            const logo = cc.instantiate(self.controller.kanLogo)
                            self.controller.logoNode.addChild(logo)
                            self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                            const clear = () => {
                                self.controller.logoNode.removeAllChildren()
                            }
                            setTimeout(clear, 2000)

                            if(old_id === self.timer_id) self.clearTimer()
                            self.furo[self.kaze].push([hai,hai,hai,hai])
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.tehai.splice(self.tehai.indexOf(hai), 1)
                            self.updateTehai(self.tehai)
                            self.updateNakihai(self.furo[self.kaze], self.kaze)
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
                    const old_id = self.timer_id
                    self.clearButton()
                    const hai: number = parsed["kakan"]["hai"][0]
                    const result = self.controller.getProtocol().emit("kakan", {"protocol": "kakan", "hai": hai, "combi": [hai,hai,hai,hai]})
                    if(result === null) return
                    result.then((bool) => {
                        if(bool){
                            self.controller.logoNode.opacity = 0
                            const logo = cc.instantiate(self.controller.kanLogo)
                            self.controller.logoNode.addChild(logo)
                            self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                            const clear = () => {
                                self.controller.logoNode.removeAllChildren()
                            }
                            setTimeout(clear, 2000)

                            if(old_id === self.timer_id) self.clearTimer()
                            self.furo[self.kaze].splice(self.furo[self.kaze].indexOf([hai,hai,hai]), 1)
                            self.furo[self.kaze].push([hai,hai,hai,hai])//これだと最後尾に入れることになる
                            self.updateNakihai(self.furo[self.kaze], self.kaze)
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
                        const hai: number = parsed["hora"]["hai"][0]
                        const result = self.controller.getProtocol().emit("hora", {"protocol": "hora", "hai": hai})
                        if(result === null) return
                        result.then((bool) => {
                            if(bool){
                                self.controller.logoNode.opacity = 0
                                const logo = cc.instantiate(self.controller.tsumoLogo)
                                self.controller.logoNode.addChild(logo)
                                self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                                const clear = () => {
                                    self.controller.logoNode.removeAllChildren()
                                }
                                setTimeout(clear, 2000)
                                
                                self.clearTimer()
                            }else{
                                //err?
                            }  
                        })
                    }, this)
                }
            }else{
                if("hai" in parsed["hora"] && "from" in parsed["hora"]){
                    const kz = this.getCha(parsed["hora"]["from"])
                    if(kz === "kami"){
                        const hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                        hai.runAction(this.dahai_cache["anim"])
                    }else if(kz === "simo"){
                        const hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
                        hai.runAction(this.dahai_cache["anim"])
                    }else if(kz === "toi"){
                        const hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                        hai.runAction(this.dahai_cache["anim"])
                    }

                    this.controller.horaBtnLabel.string = "ロン"
                    this.controller.node.getChildByName("Hora Button").active = true
                    const self = this
                    this.controller.node.getChildByName("Hora Button").once(cc.Node.EventType.TOUCH_END, () => {
                        self.clearButton()
                        const hai: number = parsed["hora"]["hai"][0]
                        const result = self.controller.getProtocol().emit("hora", {"protocol": "hora", "hai": hai})
                        if(result === null) return
                        result.then((bool) => {
                            if(bool){
                                self.controller.logoNode.opacity = 0
                                const logo = cc.instantiate(self.controller.ronLogo)
                                self.controller.logoNode.addChild(logo)
                                self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                                const clear = () => {
                                    self.controller.logoNode.removeAllChildren()
                                }
                                setTimeout(clear, 2000)

                                self.clearTimer()
                            }else{
                                //err?
                            }
                        })
                    }, this)
                }
            }
        }
        if("richi" in parsed){
            if("hai" in parsed["richi"]){
                const richiHai: number[] = parsed["richi"]["hai"]
                let hai: string[] = []
                for(let rh of richiHai){
                    hai.push(rh.toString())
                }
                this.controller.node.getChildByName("Richi Button").active = true
                const self = this
                this.controller.node.getChildByName("Richi Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.preRichi = true
                    self.clearButton()
                    //richi時の打牌行為を立直に変える処理を牌ノードごとに記入
                    const children = self.controller.tehai.children
                    for(let child of children){
                        if(child.name === "Tsumo Node Temp"){
                            for(let c of child.children){
                                if(hai.includes(c.name) === false)  c.color = new cc.Color(118,118,118,255)
                                else{
                                    //立直可能牌イベント等記入
                                    c.on(cc.Node.EventType.TOUCH_END, () => {
                                        if(self.preRichi === false) return
                                        const result = self.controller.getProtocol().emit("richi", {"protocol": "richi", "hai": Number(c.name)})
                                        if(result === null) return
                                        result.then((bool) => {
                                            if(bool){
                                                self.controller.tenbou.active = true
                                                const lb = self.controller.doraNode.getChildByName("Richi num Label").getComponent(cc.Label)
                                                lb.string = (Number(lb.string) + 1).toString()

                                                //牌を捨てて河に横向きで設置
                                                self.clearTimer()
                                                const s_n = self.getHaiTempNum(Number(c.name))
                                                const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                                                s_temp.rotation = 90
                                                self.controller.sutehai.addChild(s_temp)
                                                self.dahai_cache["kaze"] = self.kaze
                                                self.dahai_cache["uuid"] = s_temp.uuid
                                                self.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
                                                self.isTsumo = false

                                                self.updateTehai(self.tehai)
                                            }else{
                                                //err?
                                            }
                                        })
                                    })
                                }
                            }
                            continue
                        }
                        if(hai.includes(child.name) === false)  child.color = new cc.Color(118,118,118,255)
                        else{
                            child.on(cc.Node.EventType.TOUCH_END, () => {
                                if(self.preRichi === false) return
                                const result = self.controller.getProtocol().emit("richi", {"protocol": "richi", "hai": Number(child.name)})
                                if(result === null) return
                                result.then((bool) => {
                                    if(bool){
                                        self.controller.tenbou.active = true
                                        const lb = self.controller.doraNode.getChildByName("Richi num Label").getComponent(cc.Label)
                                        lb.string = (Number(lb.string) + 1).toString()

                                        //牌を捨てて河に横向きで設置
                                        self.clearTimer()
                                        if(self.isTsumo){
                                            self.tehai.push(self.tsumohai_cache)
                                            self.isTsumo = false
                                        }
                                        self.tehai.splice(self.tehai.indexOf(Number(child.name)), 1)
                                        self.updateTehai(self.tehai)

                                        const s_n = self.getHaiTempNum(Number(child.name))
                                        const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                                        s_temp.rotation = 90
                                        self.controller.sutehai.addChild(s_temp)
                                        self.dahai_cache["kaze"] = self.kaze
                                        self.dahai_cache["uuid"] = s_temp.uuid
                                        self.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
                                    }else{
                                        //err?
                                    }
                                })
                            })
                        }
                    }
                }, this)
            }
        }
    }

    public onChi(combi: number[], kaze: kaze_number): void {
        const kz = this.getCha(this.dahai_cache["kaze"])
        if(kz === "kami"){
            const c = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.kamiSutehai.removeChild(c)
        }else if(kz === "simo"){
            const c = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.simoSutehai.removeChild(c)
        }else if(kz === "toi"){
            const c = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.toiSutehai.removeChild(c)
        }else{
            const c = this.controller.sutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.sutehai.removeChild(c)
        }

        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.chiLogo)
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.chiLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.chiLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onPon(combi: number[], kaze: kaze_number): void {
        const kz = this.getCha(this.dahai_cache["kaze"])
        if(kz === "kami"){
            const c = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.kamiSutehai.removeChild(c)
        }else if(kz === "simo"){
            const c = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.simoSutehai.removeChild(c)
        }else if(kz === "toi"){
            const c = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.toiSutehai.removeChild(c)
        }else{
            const c = this.controller.sutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.sutehai.removeChild(c)
        }

        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.ponLogo)
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.ponLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.ponLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onKan(combi: number[], kaze: kaze_number): void {
        const kz = this.getCha(this.dahai_cache["kaze"])
        if(kz === "kami"){
            const c = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.kamiSutehai.removeChild(c)
        }else if(kz === "simo"){
            const c = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.simoSutehai.removeChild(c)
        }else if(kz === "toi"){
            const c = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.toiSutehai.removeChild(c)
        }else{
            const c = this.controller.sutehai.getChildByUuid(this.dahai_cache["uuid"])
            this.controller.sutehai.removeChild(c)
        }

        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onAnkan(combi: number[], kaze: kaze_number): void {
        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onKakan(combi: number[], kaze: kaze_number): void {
        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onHora(kaze: kaze_number, json: string, json2: string): void {
        const result = cc.instantiate(this.controller.resultTemp)
        const parsed = JSON.parse(json)
        const parsed2 = JSON.parse(json2)
        if("tehai" in parsed2 && "furo" in parsed2 && "horahai" in parsed2 && "dora" in parsed2 && "uradora" in parsed2){
            let hai: number[] = parsed2["tehai"]
            const furo: number[][] = parsed2["furo"]
            const dora: number[] = parsed2["dora"]
            const uradora: number[] = parsed2["uradora"]
            hai.push(500)
            if(furo.length !== 0){
                for(let f of furo){
                    hai = hai.concat(f)
                }
                hai.push(500)
            }
            hai.push(parsed2["horahai"])

            for(let h of hai){
                const n = this.getHaiTempNum(h)
                const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                if(h === 500){
                    temp.getComponent(cc.Sprite).enabled = false
                }
                result.getChildByName("Hai Node").addChild(temp)
            }

            for(let i = 0; i < 5; i++){
                if(dora[i] === undefined){
                    const n = this.getHaiTempNum(500)
                    const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                    result.getChildByName("Dorahai Node").addChild(temp)
                }else{
                    const n = this.getHaiTempNum(dora[i])
                    const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                    result.getChildByName("Dorahai Node").addChild(temp)
                }
                if(uradora[i] === undefined){
                    const un = this.getHaiTempNum(500)
                    const utemp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[un])
                    result.getChildByName("Uradorahai Node").addChild(utemp)
                }else{
                    const un = this.getHaiTempNum(uradora[i])
                    const utemp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[un])
                    result.getChildByName("Uradorahai Node").addChild(utemp)
                }
            }
        }
        if("yakuhai" in parsed && "fu" in parsed && "hansu" in parsed && "yakuman" in parsed && "point" in parsed && "bumpai" in parsed && "hora" in parsed){
            result.getChildByName("Tensu Label").getComponent(cc.Label).string = parsed["point"]
            result.getChildByName("Hansu Label").getComponent(cc.Label).string = parsed["hansu"]
            result.getChildByName("Fusu Label").getComponent(cc.Label).string = parsed["fu"]
            for(let yaku of parsed["yakuhai"]){
                const lbl = result.getChildByName("Yaku Label").getComponent(cc.Label)
                lbl.string = lbl.string + yaku["name"] + " " + yaku["hansu"] + "飜, "
            }
            let kz = "東"
            if(kaze === 1) kz = "南"
            else if(kaze === 2) kz = "西"
            else if(kaze === 3) kz = "北"
            if("hora" in parsed){
                if(parsed["hora"] === "ron"){
                    result.getChildByName("Name Label").getComponent(cc.Label).string = `${kz}家 ロン`
                }else{
                    result.getChildByName("Name Label").getComponent(cc.Label).string = `${kz}家 ツモ`
                }
            }
        }
        const self = this
        result.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
        })

        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            let logo: cc.Node
            if(parsed["hora"] === "ron"){
                logo = cc.instantiate(this.controller.ronLogo)
            }else{
                logo = cc.instantiate(this.controller.tsumoLogo)
            }
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            let logo: cc.Node
            if(parsed["hora"] === "ron"){
                logo = cc.instantiate(this.controller.ronLogo)
            }else{
                logo = cc.instantiate(this.controller.tsumoLogo)
            }
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            let logo: cc.Node
            if(parsed["hora"] === "ron"){
                logo = cc.instantiate(this.controller.ronLogo)
            }else{
                logo = cc.instantiate(this.controller.tsumoLogo)
            }
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }

        setTimeout(() => {this.controller.node.addChild(result)}, 2100)
    }

    public onRichi(richiHai: number, kaze: kaze_number): void {
        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiTenbou.active = true
        }else if(k === "simo"){
            this.controller.simoTenbou.active = true
        }else if(k === "toi"){
            this.controller.toiTenbou.active = true
        }
        const lb = this.controller.doraNode.getChildByName("Richi num Label").getComponent(cc.Label)
        lb.string = (Number(lb.string) + 1).toString()

        //todo 画像表示
        this.onDahai(richiHai, kaze, true)
    }

    public onResetTestFunc(): void{
        this.controller.node.getChildByName("Test Button").active = true
        const self = this
        this.controller.node.getChildByName("Test Button").once(cc.Node.EventType.TOUCH_END, () => {
           self.controller.getParent().getController().changeNode("room")
        }, this)
    }

    public onRyukyoku(type: ryukyoku){
        const ryukyoku = cc.instantiate(this.controller.ryukyokuNode)
        ryukyoku.getChildByName("Ryukyoku Label").getComponent(cc.Label).string = type
        const self = this
        ryukyoku.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.node.removeChild(self.controller.node.getChildByName("Ryukyoku Temp"))
        })
        this.controller.node.addChild(ryukyoku)
    }

    public onRyukyokuByPlayer(kaze: kaze_number, type: ryukyoku){
        //todo
        const ryukyoku = cc.instantiate(this.controller.ryukyokuNode)
        ryukyoku.getChildByName("Ryukyoku Label").getComponent(cc.Label).string = type
        const self = this
        ryukyoku.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.node.removeChild(self.controller.node.getChildByName("Ryukyoku Temp"))
        })
        this.controller.node.addChild(ryukyoku)
    }

    public onKantsumo(_hai: number){
        this.tsumohai_cache = _hai
        this.isTsumo = true
        const tp = this.controller.tehai.getChildByName("Tsumo Node Temp")
        this.controller.tehai.removeChild(tp)
        const n = this.getHaiTempNum(_hai)
        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
        const self = this
        const hai = _hai
        temp.on(cc.Node.EventType.TOUCH_END, () => {
            if(self.preRichi) return
            const result = self.controller.getProtocol().emit("dahai", {"protocol": "dahai", "hai": hai})
            if(result === null) return
            result.then((bool) => {
                if(bool){
                    self.clearTimer()
                    const s_n = self.getHaiTempNum(hai)
                    const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                    self.controller.sutehai.addChild(s_temp)
                    self.dahai_cache["kaze"] = self.kaze
                    self.dahai_cache["uuid"] = s_temp.uuid
                    self.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
                    self.isTsumo = false
                }
            })
        })
        const t_tmp = cc.instantiate(this.controller.tsumohai)
        this.controller.tehai.addChild(t_tmp)
        this.controller.tehai.getChildByName("Tsumo Node Temp").addChild(temp)
    }

    private clearTimer(): void{
        if(this.timer !== null){
            this.clearButton()
            this.clearSutehai()
            clearInterval(this.timer)
            this.time = null
            this.timer = null
            this.controller.timeLabel.string = ""
            const tp = this.controller.tehai.getChildByName("Tsumo Node Temp")
            this.controller.tehai.removeChild(tp)

            this.updateTehai(this.tehai)
        }
    }

    private clearButton(): void{
        this.controller.node.getChildByName("Skip Button").active = false
        this.controller.node.getChildByName("Chi Button").active = false
        this.controller.node.getChildByName("Pon Button").active = false
        this.controller.node.getChildByName("Kan Button").active = false
        this.controller.node.getChildByName("Hora Button").active = false
        this.controller.node.getChildByName("Richi Button").active = false
        this.controller.horaBtnLabel.string = ""
    }

    private clearTehai(): void{
        this.controller.tehai.removeAllChildren()
    }
    private clearNakihai(kaze: kaze_number): void{
        if(kaze === this.kaze) this.controller.nakihai.removeAllChildren()
        else{
            const cha = this.getCha(kaze)
            if(cha === "kami") this.controller.kamiNakihai.removeAllChildren()
            else if(cha === "simo") this.controller.simoNakihai.removeAllChildren()
            else if(cha === "toi") this.controller.toiNakihai.removeAllChildren()
        }
    }

    private clearSutehai(): void{
        if(this.dahai_cache["kaze"] !== null){
            const p_cha = this.getCha(this.dahai_cache["kaze"])
            let p_hai = null
            if(p_cha === "kami"){
                p_hai = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
            }else if(p_cha === "simo"){
                p_hai = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
            }else if(p_cha === "toi"){
                p_hai = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])  
            }
            if(p_hai !== null){
                const target = this.dahai_cache["anim"].getOriginalTarget()
                if(target !== null){
                    p_hai.stopAction(this.dahai_cache["anim"])
                    p_hai.opacity = 255
                }
            }
        }
    }

    private haiSort(hai: number[]): number[]{
        return hai.sort((a,b) => {return a - b})
    }

    private updateTehai(hai: number[]): void{
        let new_hai = this.haiSort(hai)
        this.clearTehai()
        this.preRichi = false
        for(var i = 0; i <= new_hai.length - 1; i++){
            const n = this.getHaiTempNum(new_hai[i])
            const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
            const self = this
            const hai = new_hai[i]
            temp.on(cc.Node.EventType.TOUCH_END, () => {
                if(self.preRichi) return
                const result = self.controller.getProtocol().emit("dahai", {"protocol": "dahai", "hai": hai})
                if(result === null) return
                result.then((bool) => {
                    if(bool){
                        self.clearTimer()
                        if(self.isTsumo){
                            self.tehai.push(self.tsumohai_cache)
                            self.isTsumo = false
                        }
                        self.tehai.splice(self.tehai.indexOf(hai), 1)
                        self.updateTehai(self.tehai)

                        const s_n = self.getHaiTempNum(hai)
                        const s_temp = cc.instantiate(self.controller.getPrefabs().HAI_TEMP[s_n])
                        self.controller.sutehai.addChild(s_temp)
                        self.dahai_cache["kaze"] = self.kaze
                        self.dahai_cache["uuid"] = s_temp.uuid
                        self.dahai_cache["anim"] = cc.repeatForever(cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5)))
                    }
                })
            })
            this.controller.tehai.addChild(temp)
        }
    }

    private updateNakihai(hai: number[][], kaze: kaze_number): void{
        this.clearNakihai(kaze)
        const cha = this.getCha(kaze)
        for(let h of hai){
            const n_temp = cc.instantiate(this.controller.nakihai_node)
            for(let f of h){
                const i = Math.floor(f / 1) % 10
                const n = this.getHaiTempNum(f)
                const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                if(i !== 0 && i !== 4) temp.rotation = 90
                n_temp.addChild(temp)
            }
            if(kaze === this.kaze) this.controller.nakihai.addChild(n_temp)
            else{
                if(cha === "kami") this.controller.kamiNakihai.addChild(n_temp)
                else if(cha === "simo") this.controller.simoNakihai.addChild(n_temp)
                else if(cha === "toi") this.controller.toiNakihai.addChild(n_temp)
            }
        }
    }

    private updateDorahai(hai: number[]): void{
        //
    }

    private getCha(kaze: kaze_number): "kami" | "simo" | "toi"{
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
        return cha
    }

    private getHaiTempNum(i: number): number{
        const a = Math.floor(i / 100) % 10
        const b = Math.floor(i / 10) % 10
        const c = (a * 100) + (b * 10)
        const list = 
        {
            100: 0, 110: 1, 120: 2, 130: 3, 140: 4, 150: 5, 160: 6, 170: 7, 180: 8, 190: 9,
            200: 10, 210: 11, 220: 12, 230: 13, 240: 14, 250: 15, 260: 16, 270: 17, 280: 18, 290: 19,
            300: 20, 310: 21, 320: 22, 330: 23, 340: 24, 350: 25, 360: 26, 370: 27, 380: 28, 390: 29,
            410: 30, 420: 31, 430: 32, 440: 33, 450: 34, 460: 35, 470: 36, 500: 37
        }
        return list[c]
    }
}