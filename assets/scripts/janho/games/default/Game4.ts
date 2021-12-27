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

//ポンの牌向き修正できてない
import {Mangan} from "../../utils/Mangan";
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

    private option = {"auto_dahai": false, "auto_hora": false, "disable_furo": false}

    constructor(contoroller: GameController){
        this.controller = contoroller
    }

    public onTimein(time: number): void {
        if(time <= 0 || time === null) return
        if(this.timer !== null){
            clearInterval(this.timer)
            const chi = this.controller.node.getChildByName("Chi Node Temp")
            this.controller.node.removeChild(chi)
        }
        this.time = time
        this.timer = setInterval(() => 
        {
            this.controller.timeLabel.string = `${this.time - 1}`
            this.time = this.time - 1
            if(this.time === 0){
                this.clearButton()
                this.clearSutehai()
                clearInterval(this.timer)
                this.time = null
                this.timer = null
                this.controller.timeLabel.string = ""
                const tp = this.controller.tehai.getChildByName("Tsumo Node Temp")
                this.controller.tehai.removeChild(tp)

                const chi = this.controller.node.getChildByName("Chi Node Temp")
                this.controller.node.removeChild(chi)

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

        const func: Function = () => {
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

                    const a = Math.floor(Math.random() * 3)
                    if(a === 0) self.controller.getParent().playSound("dahai1")
                    else if(a === 1) self.controller.getParent().playSound("dahai2")
                    else if(a === 2) self.controller.getParent().playSound("dahai3")

                    self.updateTehai(self.tehai)
                }
            })
        }

        if(!this.option.auto_dahai){
            temp.on(cc.Node.EventType.TOUCH_END, func)
        }
        const t_tmp = cc.instantiate(this.controller.tsumohai)
        this.controller.tehai.addChild(t_tmp)
        this.controller.tehai.getChildByName("Tsumo Node Temp").addChild(temp)

        if(this.option.auto_dahai){
            setTimeout(() => {func.call(self)}, 500)
        }
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

        const a = Math.floor(Math.random() * 3)
        if(a === 0) this.controller.getParent().playSound("dahai1")
        else if(a === 1) this.controller.getParent().playSound("dahai2")
        else if(a === 2) this.controller.getParent().playSound("dahai3")
    }

    public onTimeout(json: string): void {
        const parsed = JSON.parse(json)
        if("protocol" in parsed){
            if(parsed["protocol"] === "dahai"){
                if("hai" in parsed){
                    if(typeof parsed["hai"] === "number"){
                        const n = this.getHaiTempNum(parsed["hai"])
                        const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                        this.controller.sutehai.addChild(temp)
                    }
                }
            }else if(parsed["protocol"] === "skip"){
                this.clearButton()
                const hai1 = this.controller.kamiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                if(hai1 !== null){
                    hai1.stopAction(this.dahai_cache["anim"])
                    hai1.opacity = 255
                }

                const hai2 = this.controller.simoSutehai.getChildByUuid(this.dahai_cache["uuid"])
                if(hai2 !== null){
                    hai2.stopAction(this.dahai_cache["anim"])
                    hai2.opacity = 255
                }

                const hai3 = this.controller.toiSutehai.getChildByUuid(this.dahai_cache["uuid"])
                if(hai3 !== null){
                    hai3.stopAction(this.dahai_cache["anim"])
                    hai3.opacity = 255
                }
            }
        }
    }

    public onCandidate(json: string): void{
        const parsed = JSON.parse(json)
        if(!("dahai" in parsed)){
            if("chi" in parsed || "pon" in parsed || "kan" in parsed || "hora" in parsed){
                if("hora" in parsed){
                    this.controller.getParent().playSound("horaNoti")
                }else if(!this.option.disable_furo){
                    this.controller.getParent().playSound("noti")
                }
                if(!this.option.disable_furo){
                    this.controller.node.getChildByName("Skip Button").active = true
                }else if("hora" in parsed){
                    this.controller.node.getChildByName("Skip Button").active = true
                }
                const self = this

                const func: Function = () => {
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
                    self.controller.getParent().playSound("click")
                }
                if(this.option.disable_furo && !("hora" in parsed)){
                    setTimeout(() => {func.call(self)}, 100)
                }else{
                    this.controller.node.getChildByName("Skip Button").once(cc.Node.EventType.TOUCH_END, func, this)
                }
            }
        }
        if("chi" in parsed){
            if("hai" in parsed["chi"] && "combi" in parsed["chi"] && "from" in parsed["chi"]){
                if(!this.option.disable_furo){
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
                        self.controller.getParent().playSound("click")
                        const old_id = self.timer_id
                        self.clearButton()

                        const combi: number[][] = parsed["chi"]["combi"]
                        let r_combi: number[]
                        if(combi.length > 1){
                            //選択肢を出して
                            const chiNode = cc.instantiate(self.controller.chiNode)
                            for(let c of combi){
                                const chiCombi = cc.instantiate(self.controller.chiCombiNode)
                                for(let h of c){
                                    if(h === parsed["chi"]["hai"][0]) continue
                                    const n = this.getHaiTempNum(h)
                                    const hai = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
                                    chiCombi.addChild(hai)
                                }
                                chiCombi.once(cc.Node.EventType.TOUCH_END, () => {
                                    excuteChi(c)
                                })
                                chiNode.getChildByName("Hai Node").addChild(chiCombi)
                            }
                            self.controller.node.addChild(chiNode)
                            clearAnim()
                        }else{
                            r_combi = combi[0]
                            excuteChi()
                        }

                        function excuteChi(option: number[] = []){
                            const hai: number = parsed["chi"]["hai"][0]
                            let result: Promise<boolean>
                            if(option.length !== 0){
                                result = self.controller.getProtocol().emit("chi", {"protocol": "chi", "hai": hai, "combi": option})
                            }else{
                                result = self.controller.getProtocol().emit("chi", {"protocol": "chi", "hai": hai, "combi": r_combi})
                            }
                            if(result === null) return
                            result.then((bool) => {
                                if(bool){
                                    self.controller.logoNode.opacity = 0
                                    const logo = cc.instantiate(self.controller.chiLogo)
                                    self.controller.logoNode.addChild(logo)
                                    self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                                    const clear = () => {
                                        self.controller.logoNode.removeAllChildren()
                                    }
                                    setTimeout(clear, 2000)
                    
                                    const kz = self.getCha(parsed["chi"]["from"])
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
                                    if(option.length !== 0){
                                        for(let h of option){
                                            if(h === hai) continue
                                            self.tehai.splice(self.tehai.indexOf(h), 1)
                                        }
                                        let i = 0
                                        for(let h of option){
                                            if(h === hai){
                                                break
                                            }
                                            i++
                                        }

                                        let j = 0
                                        if(kz === "kami") j = 1
                                        else if(kz === "simo") j = 3
                                        else if(kz === "toi") j = 2

                                        let opti = option.slice()
                                        if(i === 0) opti[0] = opti[0] + j
                                        else if(i === 1) opti[1] = opti[1] + j
                                        else if(i === 2) opti[2] = opti[2] + j
                                        self.furo[self.kaze].push(self.reChi(opti))
                                    }else{
                                        for(let h of r_combi){
                                            if(h === hai) continue
                                            self.tehai.splice(self.tehai.indexOf(h), 1)
                                        }
                                        let i = 0
                                        for(let h of r_combi){
                                            if(h === hai){
                                                break
                                            }
                                            i++
                                        }

                                        let j = 0
                                        if(kz === "kami") j = 1
                                        else if(kz === "simo") j = 3
                                        else if(kz === "toi") j = 2

                                        if(i === 0) r_combi[0] = r_combi[0] + j
                                        else if(i === 1) r_combi[1] = r_combi[1] + j
                                        else if(i === 2) r_combi[2] = r_combi[2] + j
                                        self.furo[self.kaze].push(self.reChi(r_combi))
                                    }
                                    self.updateTehai(self.tehai)
                                    self.updateNakihai(self.furo[self.kaze], self.kaze)

                                    const a = Math.floor(Math.random() * 3)
                                    if(a === 0) self.controller.getParent().playSound("furo1")
                                    else if(a === 1) self.controller.getParent().playSound("furo2")
                                    else if(a === 2) self.controller.getParent().playSound("furo3")
                                }else{
                                    clearAnim()
                                    self.clearTimer()
                                }
                            })
                        }

                        function clearAnim(){
                            if(kz === "kami"){
                                const d_hai = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                d_hai.stopAction(self.dahai_cache["anim"])
                                d_hai.opacity = 255
                            }else if(kz === "simo"){
                                const d_hai = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                d_hai.stopAction(self.dahai_cache["anim"])
                                d_hai.opacity = 255
                            }else if(kz === "toi"){
                                const d_hai = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                d_hai.stopAction(self.dahai_cache["anim"])
                                d_hai.opacity = 255
                            }
                        }
                    }, this)
                }
            }
        }
        if("pon" in parsed){
            if("hai" in parsed["pon"] && "combi" in parsed["pon"] && "from" in parsed["pon"]){
                if(!this.option.disable_furo){
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
                        self.controller.getParent().playSound("click")
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
                                let combi = [hai,hai,hai]
                                if(kz === "kami") combi[2] = combi[2] + 1
                                else if(kz === "simo") combi[0] = combi[0] + 3
                                else if(kz === "toi") combi[1] = combi[1] + 2
                                self.furo[self.kaze].push(combi)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.updateTehai(self.tehai)
                                self.updateNakihai(self.furo[self.kaze], self.kaze)

                                const a = Math.floor(Math.random() * 3)
                                if(a === 0) self.controller.getParent().playSound("furo1")
                                else if(a === 1) self.controller.getParent().playSound("furo2")
                                else if(a === 2) self.controller.getParent().playSound("furo3")
                            }else{
                                if(kz === "kami"){
                                    const d_hai = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "simo"){
                                    const d_hai = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "toi"){
                                    const d_hai = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }
                                self.clearTimer()
                            }
                        })
                    }, this)
                }
            }
        }
        if("kan" in parsed){
            if("hai" in parsed["kan"] && "combi" in parsed["kan"] && "from" in parsed["kan"]){
                if(!this.option.disable_furo){
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
                        self.controller.getParent().playSound("click")
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
                                let combi = [hai,hai,hai,hai]
                                if(kz === "kami") combi[3] = combi[3] + 1
                                else if(kz === "simo") combi[0] = combi[0] + 3
                                else if(kz === "toi") combi[1] = combi[1] + 2
                                self.furo[self.kaze].push(combi)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.updateTehai(self.tehai)
                                self.updateNakihai(self.furo[self.kaze], self.kaze)

                                const a = Math.floor(Math.random() * 3)
                                if(a === 0) self.controller.getParent().playSound("furo1")
                                else if(a === 1) self.controller.getParent().playSound("furo2")
                                else if(a === 2) self.controller.getParent().playSound("furo3")
                            }else{
                                if(kz === "kami"){
                                    const d_hai = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "simo"){
                                    const d_hai = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "toi"){
                                    const d_hai = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }
                                self.clearTimer()
                            }
                        })
                    }, this)
                }
            }
        }else if("ankan" in parsed){
            if("hai" in parsed["ankan"] && "combi" in parsed["ankan"]){
                if(!this.option.disable_furo){
                    this.controller.getParent().playSound("noti")
                    this.controller.node.getChildByName("Kan Button").active = true
                    const self = this
                    this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                        self.controller.getParent().playSound("click")
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
                                self.furo[self.kaze].push([500,hai,hai,500])
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.tehai.splice(self.tehai.indexOf(hai), 1)
                                self.updateTehai(self.tehai)
                                self.updateNakihai(self.furo[self.kaze], self.kaze)

                                const a = Math.floor(Math.random() * 3)
                                if(a === 0) self.controller.getParent().playSound("furo1")
                                else if(a === 1) self.controller.getParent().playSound("furo2")
                                else if(a === 2) self.controller.getParent().playSound("furo3")
                            }else{
                                //err?
                            }
                        })
                    }, this)
                }
            }
        }else if("kakan" in parsed){
            if("hai" in parsed["kakan"] && "combi" in parsed["kakan"]){
                if(!this.option.disable_furo){
                    this.controller.getParent().playSound("noti")
                    this.controller.node.getChildByName("Kan Button").active = true
                    const self = this
                    this.controller.node.getChildByName("Kan Button").once(cc.Node.EventType.TOUCH_END, () => {
                        self.controller.getParent().playSound("click")
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

                                const a = Math.floor(Math.random() * 3)
                                if(a === 0) self.controller.getParent().playSound("furo1")
                                else if(a === 1) self.controller.getParent().playSound("furo2")
                                else if(a === 2) self.controller.getParent().playSound("furo3")
                            }else{
                                //err?
                            }
                        })
                    }, this)
                }
            }
        }
        if("hora" in parsed){
            if("dahai" in parsed){
                if("hai" in parsed["hora"]){
                    this.controller.getParent().playSound("horaNoti")
                    this.controller.horaBtnLabel.string = "ツモ"
                    this.controller.node.getChildByName("Hora Button").active = true
                    const self = this

                    const func: Function = () => {
                        self.controller.getParent().playSound("click")
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
                    }

                    if(!this.option.auto_hora){
                        this.controller.node.getChildByName("Hora Button").once(cc.Node.EventType.TOUCH_END, func, this)
                    }else{
                        setTimeout(() => {func.call(self)}, 100)
                    }
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

                    const func: Function = () => {
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
                                if(kz === "kami"){
                                    const d_hai = self.controller.kamiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "simo"){
                                    const d_hai = self.controller.simoSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }else if(kz === "toi"){
                                    const d_hai = self.controller.toiSutehai.getChildByUuid(self.dahai_cache["uuid"])
                                    d_hai.stopAction(self.dahai_cache["anim"])
                                    d_hai.opacity = 255
                                }
                                self.clearTimer()
                            }
                        })
                    }

                    if(!this.option.auto_hora){
                        this.controller.node.getChildByName("Hora Button").once(cc.Node.EventType.TOUCH_END, func, this)
                    }else{
                        setTimeout(() => {func.call(self)}, 100)
                    }
                }
            }
        }
        if("richi" in parsed){
            if("hai" in parsed["richi"]){
                if(!("hora" in parsed)){
                    this.controller.getParent().playSound("noti")
                }
                const richiHai: number[] = parsed["richi"]["hai"]
                let hai: string[] = []
                for(let rh of richiHai){
                    hai.push(rh.toString())
                }
                this.controller.node.getChildByName("Richi Button").active = true
                const self = this
                this.controller.node.getChildByName("Richi Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.controller.getParent().playSound("click")
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
                                                self.controller.logoNode.opacity = 0
                                                const logo = cc.instantiate(self.getRichiLogo())
                                                self.controller.logoNode.addChild(logo)
                                                self.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
                                                const clear = () => {
                                                    self.controller.logoNode.removeAllChildren()
                                                }
                                                setTimeout(clear, 2000)
                                                
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

                                                const a = Math.floor(Math.random() * 3)
                                                if(a === 0) self.controller.getParent().playSound("furo1")
                                                else if(a === 1) self.controller.getParent().playSound("furo2")
                                                else if(a === 2) self.controller.getParent().playSound("furo3")

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

                                        const a = Math.floor(Math.random() * 3)
                                        if(a === 0) self.controller.getParent().playSound("furo1")
                                        else if(a === 1) self.controller.getParent().playSound("furo2")
                                        else if(a === 2) self.controller.getParent().playSound("furo3")
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
        if("kyushu" in parsed){
            if(!("hora" in parsed) && !("richi" in parsed)){
                this.controller.getParent().playSound("noti")
            }
            this.controller.node.getChildByName("Ryukyoku Button").active = true
            const self = this
            this.controller.node.getChildByName("Ryukyoku Button").once(cc.Node.EventType.TOUCH_END, () => {
                self.controller.getParent().playSound("click")
                const old_id = self.timer_id
                self.clearButton()
                self.clearSutehai()
                const result = self.controller.getProtocol().emit("ryukyoku", {"protocol": "ryukyoku"})
                if(result === null) return
                result.then((bool) => {
                    if(bool){
                        if(old_id === self.timer_id) self.clearTimer()
                    }else{
                        //err?
                    }
                })
            })
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
        }else{
            this.controller.logoNode.opacity = 0
            const logo = cc.instantiate(this.controller.chiLogo)
            this.controller.logoNode.addChild(logo)
            this.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.logoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            for(let h of combi){
                const i = Math.floor(h / 1) % 10
                if(i !== 0) continue
                this.tehai.splice(this.tehai.indexOf(h), 1)
            }
            this.updateTehai(this.tehai)
        }

        this.furo[kaze].push(this.reChi(combi))
        this.updateNakihai(this.furo[kaze], kaze)

        const a = Math.floor(Math.random() * 3)
        if(a === 0) this.controller.getParent().playSound("furo1")
        else if(a === 1) this.controller.getParent().playSound("furo2")
        else if(a === 2) this.controller.getParent().playSound("furo3")
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
        }else{
            this.controller.logoNode.opacity = 0
            const logo = cc.instantiate(this.controller.ponLogo)
            this.controller.logoNode.addChild(logo)
            this.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.logoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            for(let h of combi){
                const i = Math.floor(h / 1) % 10
                if(i !== 0) continue
                this.tehai.splice(this.tehai.indexOf(h), 1)
            }
            this.updateTehai(this.tehai)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)

        const a = Math.floor(Math.random() * 3)
        if(a === 0) this.controller.getParent().playSound("furo1")
        else if(a === 1) this.controller.getParent().playSound("furo2")
        else if(a === 2) this.controller.getParent().playSound("furo3")
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
        }else{
            this.controller.logoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.logoNode.addChild(logo)
            this.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.logoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            for(let h of combi){
                const i = Math.floor(h / 1) % 10
                if(i !== 0) continue
                this.tehai.splice(this.tehai.indexOf(h), 1)
            }
            this.updateTehai(this.tehai)
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)

        const a = Math.floor(Math.random() * 3)
        if(a === 0) this.controller.getParent().playSound("furo1")
        else if(a === 1) this.controller.getParent().playSound("furo2")
        else if(a === 2) this.controller.getParent().playSound("furo3")
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

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
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

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.controller.kanLogo)
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)

            const a = Math.floor(Math.random() * 3)
            if(a === 0) this.controller.getParent().playSound("furo1")
            else if(a === 1) this.controller.getParent().playSound("furo2")
            else if(a === 2) this.controller.getParent().playSound("furo3")
        }

        this.furo[kaze].push(combi)
        this.updateNakihai(this.furo[kaze], kaze)
    }

    public onHora(kaze: kaze_number, json: string, json2: string, isOne = true, cCallback: Function = null, isNagashi = false): void {
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
            if(parsed2["horahai"].length !== 0)
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
            result.getChildByName("PName Label").getComponent(cc.Label).string = parsed2["name"]
        }
        if("yakuhai" in parsed && "fu" in parsed && "hansu" in parsed && "yakuman" in parsed && "point" in parsed && "bumpai" in parsed && "hora" in parsed){
            result.getChildByName("Tensu Label").getComponent(cc.Label).string = parsed["point"]
            result.getChildByName("Hansu Label").getComponent(cc.Label).string = parsed["hansu"]
            result.getChildByName("Fusu Label").getComponent(cc.Label).string = parsed["fu"]

            let yakuman = 0

            const yakuLbl = result.getChildByName("Yaku Label")
            for(let yaku of parsed["yakuhai"]){
                const lbl = cc.instantiate(this.controller.yakuLabel)
                let space = "　"
                let i = 12 - (yaku["name"].length + 3)
                if(i > 0){
                    for(i; i > 0; i--){
                        space = space + "　"
                    }
                }
                lbl.getComponent(cc.Label).string =  "　" + yaku["name"] + space + yaku["hansu"] + "飜"
                if(yaku["hansu"] === "*") yakuman++
                else if(yaku["hansu"] === "**") yakuman = yakuman + 2
                yakuLbl.addChild(lbl)
            }

            const mangan = Mangan.getString(parsed["fu"], parsed["han"], yakuman)
            const logoNode1 = result.getChildByName("Logo Node 1")
            const logoNode2 = result.getChildByName("Logo Node 2")
            switch(mangan){
                case "満貫":
                    logoNode1.addChild(cc.instantiate(this.controller.manganLogo))
                    break
                case "跳満":
                    logoNode1.addChild(cc.instantiate(this.controller.hanemanLogo))
                    break
                case "倍満":
                    logoNode1.addChild(cc.instantiate(this.controller.baimanLogo))
                    break
                case "三倍満":
                    logoNode1.addChild(cc.instantiate(this.controller.sanbaiLogo))
                    break
                case "数え役満":
                    logoNode2.addChild(cc.instantiate(this.controller.kazoeLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "役満":
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "二倍役満":
                    logoNode2.addChild(cc.instantiate(this.controller.nibaiLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "三倍役満":
                    logoNode2.addChild(cc.instantiate(this.controller.sanbaiLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "四倍役満":
                    logoNode2.addChild(cc.instantiate(this.controller.yonbaiLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "五倍役満":
                    logoNode2.addChild(cc.instantiate(this.controller.gobaiLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
                case "六倍役満":
                    logoNode2.addChild(cc.instantiate(this.controller.rokubaiLogo))
                    logoNode1.addChild(cc.instantiate(this.controller.yakumanLogo))
                    break
            }
            if(isNagashi){
                logoNode2.addChild(cc.instantiate(this.controller.nagashiLogo))
                logoNode1.addChild(cc.instantiate(this.controller.manganLogo))
            }

            let kz = "東"
            if(kaze === 1) kz = "南"
            else if(kaze === 2) kz = "西"
            else if(kaze === 3) kz = "北"
            if("hora" in parsed){
                if(parsed["hora"] === "ron"){
                    result.getChildByName("Name Label").getComponent(cc.Label).string = `${kz}家 ロン`
                }else if(parsed["hora"] === "tsumo"){
                    result.getChildByName("Name Label").getComponent(cc.Label).string = `${kz}家 ツモ`
                }else{
                    result.getChildByName("Name Label").getComponent(cc.Label).string = `${kz}家`
                }
            }
        }
        if(cCallback === null){
            const self = this
            result.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
                self.controller.getParent().playSound("click")
                self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                const point_t = cc.instantiate(self.controller.pointTemp)

                //name
                point_t.getChildByName("Name").getComponent(cc.Label).string = self.controller.nameLabel.string
                point_t.getChildByName("Kami Name").getComponent(cc.Label).string = self.controller.kamiNameLabel.string
                point_t.getChildByName("Toi Name").getComponent(cc.Label).string = self.controller.toiNameLabel.string
                point_t.getChildByName("Simo Name").getComponent(cc.Label).string = self.controller.simoNameLabel.string

                //cmp
                let cmp_ = 0
                let cmp_k = 0
                let cmp_t = 0
                let cmp_s = 0
                switch(this.kaze){
                    case 0:
                        cmp_ = parsed["bumpai"][0]
                        cmp_k = parsed["bumpai"][1]
                        cmp_t = parsed["bumpai"][2]
                        cmp_s = parsed["bumpai"][3]
                        break
                    case 1:
                        cmp_ = parsed["bumpai"][1]
                        cmp_k = parsed["bumpai"][2]
                        cmp_t = parsed["bumpai"][3]
                        cmp_s = parsed["bumpai"][0]
                        break
                    case 2:
                        cmp_ = parsed["bumpai"][2]
                        cmp_k = parsed["bumpai"][3]
                        cmp_t = parsed["bumpai"][0]
                        cmp_s = parsed["bumpai"][1]
                        break
                    case 3:
                        cmp_ = parsed["bumpai"][3]
                        cmp_k = parsed["bumpai"][0]
                        cmp_t = parsed["bumpai"][1]
                        cmp_s = parsed["bumpai"][2]
                        break
                }
                let cmps_ = cmp_.toString()
                let cmps_k = cmp_k.toString()
                let cmps_t = cmp_t.toString()
                let cmps_s = cmp_s.toString()
                if(cmp_ < 0){
                    cmps_ = "(" + cmps_ + ")"
                }else{
                    cmps_ = "(+" + cmps_ + ")"
                }
                if(cmp_k < 0){
                    cmps_k = "(" + cmps_k + ")"
                }else{
                    cmps_k = "(+" + cmps_k + ")"
                }
                if(cmp_t < 0){
                    cmps_t = "(" + cmps_t + ")"
                }else{
                    cmps_t = "(+" + cmps_t + ")"
                }
                if(cmp_s < 0){
                    cmps_s = "(" + cmps_s + ")"
                }else{
                    cmps_s = "(+" + cmps_s + ")"
                }
                point_t.getChildByName("Cmp").getComponent(cc.Label).string = cmps_
                point_t.getChildByName("Kami Cmp").getComponent(cc.Label).string = cmps_k
                point_t.getChildByName("Toi Cmp").getComponent(cc.Label).string = cmps_t
                point_t.getChildByName("Simo Cmp").getComponent(cc.Label).string = cmps_s

                //point
                point_t.getChildByName("Point").getComponent(cc.Label).string = 
                (Number(self.controller.node.getChildByName("Tensu").getComponent(cc.Label).string) + cmp_).toString()
                point_t.getChildByName("Kami Point").getComponent(cc.Label).string = 
                (Number(self.controller.node.getChildByName("Kami Tensu").getComponent(cc.Label).string) + cmp_k).toString()
                point_t.getChildByName("Toi Point").getComponent(cc.Label).string = 
                (Number(self.controller.node.getChildByName("Toi Tensu").getComponent(cc.Label).string) + cmp_t).toString()
                point_t.getChildByName("Simo Point").getComponent(cc.Label).string = 
                (Number(self.controller.node.getChildByName("Simo Tensu").getComponent(cc.Label).string) + cmp_s).toString()

                point_t.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
                    self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                })
                self.controller.node.addChild(point_t)
            })
        }else{
            result.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, cCallback)
        }

        if(isOne){
            this.viewHoraLogo(kaze, parsed["hora"])
            setTimeout(() => {this.controller.node.addChild(result)}, 2100)
        }else{
            this.controller.node.addChild(result)
        }
    }

    public onManyHora(kazes: kaze_number[], json: string, json2: string): void {
        const parsed = JSON.parse(json)
        const parsed2 = JSON.parse(json2)
        for(let i = 0; i < kazes.length; i++){
            if("hora" in parsed[i])
                this.viewHoraLogo(kazes[i], parsed[i]["hora"])
        }
        //トリロンは流局
        setTimeout(() => {
            if(kazes.length >= 3){
                let tehais: {[key in kaze_number]: number[]}
                tehais = {0: null, 1: null, 2: null, 3: null}
                let i = 0
                for(let k of kazes){
                    tehais[k] = parsed2[i]["tehai"]
                    i++
                }
                this.onRyukyoku("三家和", tehais)
                return
            }
            const self = this
            this.onHora(kazes[0], JSON.stringify(parsed[0]), JSON.stringify(parsed2[0]), false, () => {
                self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                setTimeout(() => {
                    self.onHora(kazes[1], JSON.stringify(parsed[1]), JSON.stringify(parsed2[1]), false, () => {
                        self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                        const point_t = cc.instantiate(self.controller.pointTemp)

                        //name
                        point_t.getChildByName("Name").getComponent(cc.Label).string = self.controller.nameLabel.string
                        point_t.getChildByName("Kami Name").getComponent(cc.Label).string = self.controller.kamiNameLabel.string
                        point_t.getChildByName("Toi Name").getComponent(cc.Label).string = self.controller.toiNameLabel.string
                        point_t.getChildByName("Simo Name").getComponent(cc.Label).string = self.controller.simoNameLabel.string

                        //cmp
                        let cmp_ = 0
                        let cmp_k = 0
                        let cmp_t = 0
                        let cmp_s = 0
                        switch(this.kaze){
                            case 0:
                                cmp_ = parsed[0]["bumpai"][0] + parsed[1]["bumpai"][0]
                                cmp_k = parsed[0]["bumpai"][1] + parsed[1]["bumpai"][1]
                                cmp_t = parsed[0]["bumpai"][2] + parsed[1]["bumpai"][2]
                                cmp_s = parsed[0]["bumpai"][3] + parsed[1]["bumpai"][3]
                                break
                            case 1:
                                cmp_ = parsed[0]["bumpai"][1] + parsed[1]["bumpai"][1]
                                cmp_k = parsed[0]["bumpai"][2] + parsed[1]["bumpai"][2]
                                cmp_t = parsed[0]["bumpai"][3] + parsed[1]["bumpai"][3]
                                cmp_s = parsed[0]["bumpai"][0] + parsed[1]["bumpai"][0]
                                break
                            case 2:
                                cmp_ = parsed[0]["bumpai"][2] + parsed[1]["bumpai"][2]
                                cmp_k = parsed[0]["bumpai"][3] + parsed[1]["bumpai"][3]
                                cmp_t = parsed[0]["bumpai"][0] + parsed[1]["bumpai"][0]
                                cmp_s = parsed[0]["bumpai"][1] + parsed[1]["bumpai"][1]
                                break
                            case 3:
                                cmp_ = parsed[0]["bumpai"][3] + parsed[1]["bumpai"][3]
                                cmp_k = parsed[0]["bumpai"][0] + parsed[1]["bumpai"][0]
                                cmp_t = parsed[0]["bumpai"][1] + parsed[1]["bumpai"][1]
                                cmp_s = parsed[0]["bumpai"][2] + parsed[1]["bumpai"][2]
                                break
                        }
                        let cmps_ = cmp_.toString()
                        let cmps_k = cmp_k.toString()
                        let cmps_t = cmp_t.toString()
                        let cmps_s = cmp_s.toString()
                        if(cmp_ < 0){
                            cmps_ = "(" + cmps_ + ")"
                        }else{
                            cmps_ = "(+" + cmps_ + ")"
                        }
                        if(cmp_k < 0){
                            cmps_k = "(" + cmps_k + ")"
                        }else{
                            cmps_k = "(+" + cmps_k + ")"
                        }
                        if(cmp_t < 0){
                            cmps_t = "(" + cmps_t + ")"
                        }else{
                            cmps_t = "(+" + cmps_t + ")"
                        }
                        if(cmp_s < 0){
                            cmps_s = "(" + cmps_s + ")"
                        }else{
                            cmps_s = "(+" + cmps_s + ")"
                        }
                        point_t.getChildByName("Cmp").getComponent(cc.Label).string = cmps_
                        point_t.getChildByName("Kami Cmp").getComponent(cc.Label).string = cmps_k
                        point_t.getChildByName("Toi Cmp").getComponent(cc.Label).string = cmps_t
                        point_t.getChildByName("Simo Cmp").getComponent(cc.Label).string = cmps_s

                        //point
                        point_t.getChildByName("Point").getComponent(cc.Label).string = 
                        (Number(self.controller.node.getChildByName("Tensu").getComponent(cc.Label).string) + cmp_).toString()
                        point_t.getChildByName("Kami Point").getComponent(cc.Label).string = 
                        (Number(self.controller.node.getChildByName("Kami Tensu").getComponent(cc.Label).string) + cmp_k).toString()
                        point_t.getChildByName("Toi Point").getComponent(cc.Label).string = 
                        (Number(self.controller.node.getChildByName("Toi Tensu").getComponent(cc.Label).string) + cmp_t).toString()
                        point_t.getChildByName("Simo Point").getComponent(cc.Label).string = 
                        (Number(self.controller.node.getChildByName("Simo Tensu").getComponent(cc.Label).string) + cmp_s).toString()

                        point_t.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
                            self.controller.getParent().playSound("click")
                            self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                        })
                        self.controller.node.addChild(point_t)
                    })
                }, 500)
            })
        }, 2100)
    }

    private viewHoraLogo(kaze: kaze_number, hora: string){
        const k = this.getCha(kaze)
        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            let logo: cc.Node
            if(hora === "ron"){
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
            if(hora === "ron"){
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
            if(hora === "ron"){
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
        }else{
            this.controller.logoNode.opacity = 0
            let logo: cc.Node
            if(hora === "ron"){
                logo = cc.instantiate(this.controller.ronLogo)
            }else{
                logo = cc.instantiate(this.controller.tsumoLogo)
            }
            this.controller.logoNode.addChild(logo)
            this.controller.logoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.logoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }
        this.controller.getParent().playSound("hora")
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

        if(k === "kami"){
            this.controller.kamiLogoNode.opacity = 0
            const logo = cc.instantiate(this.getRichiLogo())
            this.controller.kamiLogoNode.addChild(logo)
            this.controller.kamiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.kamiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "simo"){
            this.controller.simoLogoNode.opacity = 0
            const logo = cc.instantiate(this.getRichiLogo())
            this.controller.simoLogoNode.addChild(logo)
            this.controller.simoLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.simoLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }else if(k === "toi"){
            this.controller.toiLogoNode.opacity = 0
            const logo = cc.instantiate(this.getRichiLogo())
            this.controller.toiLogoNode.addChild(logo)
            this.controller.toiLogoNode.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(1.8), cc.fadeOut(0.1)))
            const clear = () => {
                this.controller.toiLogoNode.removeAllChildren()
            }
            setTimeout(clear, 2000)
        }
        this.onDahai(richiHai, kaze, true)
    }

    public onResetTestFunc(): void{
        this.controller.node.getChildByName("Test Button").active = true
        const self = this
        this.controller.node.getChildByName("Test Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.getParent().playSound("click")
           self.controller.getParent().getController().changeNode("room")
        }, this)
    }

    public onRyukyoku(type: ryukyoku, tehais: {[key in kaze_number]: number[]} = null, point: number[] = [0,0,0,0]){
        const ryukyoku = cc.instantiate(this.controller.ryukyokuNode)
        ryukyoku.getChildByName("Ryukyoku Label").getComponent(cc.Label).string = type
        if(tehais !== null){
            for(let k of Object.keys(tehais)){
                let kaze: kaze_number = 0
                if(k === "1") kaze = 1
                else if(k === "2") kaze = 2
                else if(k === "3") kaze = 3
                if(kaze === this.kaze || tehais[k] === null) continue
                this.addOtherTehai(kaze, tehais[k])
            }
        }
        const self = this
        ryukyoku.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.getParent().playSound("click")
            self.controller.node.removeChild(self.controller.node.getChildByName("Ryukyoku Temp"))
            const point_t = cc.instantiate(self.controller.pointTemp)

            //name
            point_t.getChildByName("Name").getComponent(cc.Label).string = self.controller.nameLabel.string
            point_t.getChildByName("Kami Name").getComponent(cc.Label).string = self.controller.kamiNameLabel.string
            point_t.getChildByName("Toi Name").getComponent(cc.Label).string = self.controller.toiNameLabel.string
            point_t.getChildByName("Simo Name").getComponent(cc.Label).string = self.controller.simoNameLabel.string

            //cmp
            let cmp_ = 0
            let cmp_k = 0
            let cmp_t = 0
            let cmp_s = 0
            switch(this.kaze){
                case 0:
                    cmp_ = point[0]
                    cmp_k = point[1]
                    cmp_t = point[2]
                    cmp_s = point[3]
                    break
                case 1:
                    cmp_ = point[1]
                    cmp_k = point[2]
                    cmp_t = point[3]
                    cmp_s = point[0]
                    break
                case 2:
                    cmp_ = point[2]
                    cmp_k = point[3]
                    cmp_t = point[0]
                    cmp_s = point[1]
                    break
                case 3:
                    cmp_ = point[3]
                    cmp_k = point[0]
                    cmp_t = point[1]
                    cmp_s = point[2]
                    break
            }
            let cmps_ = cmp_.toString()
            let cmps_k = cmp_k.toString()
            let cmps_t = cmp_t.toString()
            let cmps_s = cmp_s.toString()
            if(cmp_ < 0){
                cmps_ = "(" + cmps_ + ")"
            }else{
                cmps_ = "(+" + cmps_ + ")"
            }
            if(cmp_k < 0){
                cmps_k = "(" + cmps_k + ")"
            }else{
                cmps_k = "(+" + cmps_k + ")"
            }
            if(cmp_t < 0){
                cmps_t = "(" + cmps_t + ")"
            }else{
                cmps_t = "(+" + cmps_t + ")"
            }
            if(cmp_s < 0){
                cmps_s = "(" + cmps_s + ")"
            }else{
                cmps_s = "(+" + cmps_s + ")"
            }
            point_t.getChildByName("Cmp").getComponent(cc.Label).string = cmps_
            point_t.getChildByName("Kami Cmp").getComponent(cc.Label).string = cmps_k
            point_t.getChildByName("Toi Cmp").getComponent(cc.Label).string = cmps_t
            point_t.getChildByName("Simo Cmp").getComponent(cc.Label).string = cmps_s

            //point
            point_t.getChildByName("Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Tensu").getComponent(cc.Label).string) + cmp_).toString()
            point_t.getChildByName("Kami Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Kami Tensu").getComponent(cc.Label).string) + cmp_k).toString()
            point_t.getChildByName("Toi Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Toi Tensu").getComponent(cc.Label).string) + cmp_t).toString()
            point_t.getChildByName("Simo Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Simo Tensu").getComponent(cc.Label).string) + cmp_s).toString()

            point_t.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
                self.controller.getParent().playSound("click")
                self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
            })
            self.controller.node.addChild(point_t)
        })
        this.controller.node.addChild(ryukyoku)
    }

    public onRyukyokuByPlayer(kaze: kaze_number, type: ryukyoku, tehai: number[]){
        //todo
        const ryukyoku = cc.instantiate(this.controller.ryukyokuNode)
        ryukyoku.getChildByName("Ryukyoku Label").getComponent(cc.Label).string = type
        if(kaze !== this.kaze)
            this.addOtherTehai(kaze, tehai)
        const self = this
        ryukyoku.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.getParent().playSound("click")
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

    public onInfo(bakaze: number, kyoku: number, homba: number, richi: number, point: number[]): void{
        let b = "東"
        if(bakaze === 1) b = "南"
        else if(bakaze === 2) b = "西"
        else if(bakaze === 3) b = "北"

        let k = "１"
        if(kyoku === 2) k = "２"
        else if(kyoku === 3) k = "３"
        else if(kyoku === 4) k = "４"

        this.controller.roundLabel.string = b+k+"局"
        this.controller.doraNode.getChildByName("Richi num Label").getComponent(cc.Label).string = richi.toString()
        this.controller.doraNode.getChildByName("Honba num Label").getComponent(cc.Label).string = homba.toString()

        for(let i = 0; i <= 3; i++){
            let cha = this.getCha(0)

            if(i === 1) cha = this.getCha(1)
            else if(i === 2) cha = this.getCha(2)
            else if(i === 3) cha = this.getCha(3)
            
            if(cha === "kami") this.controller.kamiTensu.string = point[i].toString()
            else if(cha === "simo") this.controller.simoTensu.string = point[i].toString()
            else if(cha === "toi") this.controller.toiTensu.string = point[i].toString()
            else this.controller.tensu.string = point[i].toString()
        }
    }

    public onEnd(){
        //点数移動
        this.controller.node.getChildByName("Test Button").active = true
        const self = this
        this.controller.node.getChildByName("Test Button").once(cc.Node.EventType.TOUCH_END, () => {
            self.controller.getParent().playSound("click")
            self.controller.getParent().getController().changeNode("game")
        }, this)
    }

    public onNagashiMangan(kazes: kaze_number[], json: string, json2: string, point: number[]): void {
        if(kazes.length >= 3){
            this.onRyukyoku("荒牌平局")
            return
        }
        const parsed = JSON.parse(json)
        const parsed2 = JSON.parse(json2)
        const self = this

        const pf: Function = () => {
            self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
            const point_t = cc.instantiate(self.controller.pointTemp)

            //name
            point_t.getChildByName("Name").getComponent(cc.Label).string = self.controller.nameLabel.string
            point_t.getChildByName("Kami Name").getComponent(cc.Label).string = self.controller.kamiNameLabel.string
            point_t.getChildByName("Toi Name").getComponent(cc.Label).string = self.controller.toiNameLabel.string
            point_t.getChildByName("Simo Name").getComponent(cc.Label).string = self.controller.simoNameLabel.string

            //cmp
            let cmp_ = 0
            let cmp_k = 0
            let cmp_t = 0
            let cmp_s = 0
            switch(this.kaze){
                case 0:
                    cmp_ = point[0]
                    cmp_k = point[1]
                    cmp_t = point[2]
                    cmp_s = point[3]
                    break
                case 1:
                    cmp_ = point[1]
                    cmp_k = point[2]
                    cmp_t = point[3]
                    cmp_s = point[0]
                    break
                case 2:
                    cmp_ = point[2]
                    cmp_k = point[3]
                    cmp_t = point[0]
                    cmp_s = point[1]
                    break
                case 3:
                    cmp_ = point[3]
                    cmp_k = point[0]
                    cmp_t = point[1]
                    cmp_s = point[2]
                    break
            }
            let cmps_ = cmp_.toString()
            let cmps_k = cmp_k.toString()
            let cmps_t = cmp_t.toString()
            let cmps_s = cmp_s.toString()
            if(cmp_ < 0){
                cmps_ = "(" + cmps_ + ")"
            }else{
                cmps_ = "(+" + cmps_ + ")"
            }
            if(cmp_k < 0){
                cmps_k = "(" + cmps_k + ")"
            }else{
                cmps_k = "(+" + cmps_k + ")"
            }
            if(cmp_t < 0){
                cmps_t = "(" + cmps_t + ")"
            }else{
                cmps_t = "(+" + cmps_t + ")"
            }
            if(cmp_s < 0){
                cmps_s = "(" + cmps_s + ")"
            }else{
                cmps_s = "(+" + cmps_s + ")"
            }
            point_t.getChildByName("Cmp").getComponent(cc.Label).string = cmps_
            point_t.getChildByName("Kami Cmp").getComponent(cc.Label).string = cmps_k
            point_t.getChildByName("Toi Cmp").getComponent(cc.Label).string = cmps_t
            point_t.getChildByName("Simo Cmp").getComponent(cc.Label).string = cmps_s

            //point
            point_t.getChildByName("Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Tensu").getComponent(cc.Label).string) + cmp_).toString()
            point_t.getChildByName("Kami Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Kami Tensu").getComponent(cc.Label).string) + cmp_k).toString()
            point_t.getChildByName("Toi Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Toi Tensu").getComponent(cc.Label).string) + cmp_t).toString()
            point_t.getChildByName("Simo Point").getComponent(cc.Label).string = 
            (Number(self.controller.node.getChildByName("Simo Tensu").getComponent(cc.Label).string) + cmp_s).toString()

            point_t.getChildByName("Close Button").once(cc.Node.EventType.TOUCH_END, () => {
                self.controller.getParent().playSound("click")
                self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
            })
            self.controller.node.addChild(point_t)
        }

        if(kazes.length === 2){
            setTimeout(() => {
                const self = this
                this.onHora(kazes[0], JSON.stringify(parsed[0]), JSON.stringify(parsed2[0]), false, () => {
                    self.controller.node.removeChild(self.controller.node.getChildByName("Result Temp"))
                    setTimeout(() => {
                        self.onHora(kazes[1], JSON.stringify(parsed[1]), JSON.stringify(parsed2[1]), false, pf, true)
                    }, 500)
                }, true)
            }, 100)
        }else if(kazes.length === 1){
            setTimeout(() => {
                this.onHora(kazes[0], JSON.stringify(parsed[0]), JSON.stringify(parsed2[0]), false, pf, true)
            }, 100)
        }
    }

    public changeOption(str: string, bool: boolean): void{
        if(str === "auto_dahai"){
            this.option.auto_dahai = bool
        }else if(str === "auto_hora"){
            this.option.auto_hora = bool
        }else if(str === "disable_furo"){
            this.option.disable_furo = bool
        }
    }

    public getOption(): {"auto_dahai": boolean, "auto_hora": boolean, "disable_furo": boolean}{
        return this.option
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////

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

            const chi = this.controller.node.getChildByName("Chi Node Temp")
            this.controller.node.removeChild(chi)

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
        this.controller.node.getChildByName("Ryukyoku Button").active = false
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
            if(!this.option.auto_dahai){
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

                            const a = Math.floor(Math.random() * 3)
                            if(a === 0) self.controller.getParent().playSound("dahai1")
                            else if(a === 1) self.controller.getParent().playSound("dahai2")
                            else if(a === 2) self.controller.getParent().playSound("dahai3")
                        }
                    })
                })
            }
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

    private addOtherTehai(kaze: kaze_number, hai: number[]): void{
        const cha = this.getCha(kaze)
        let tehai = this.controller.kamiTehai
        if(cha === "simo") tehai = this.controller.simoTehai
        else if(cha === "toi") tehai = this.controller.toiTehai

        let new_hai = this.haiSort(hai)
        for(var i = 0; i <= new_hai.length - 1; i++){
            const n = this.getHaiTempNum(new_hai[i])
            const temp = cc.instantiate(this.controller.getPrefabs().HAI_TEMP[n])
            tehai.addChild(temp)
        }
    }

    private reChi(hai: number[]): number[]{
        let re: number[] = hai.slice()
        let index = 0
        for(let h of re){
            const i = Math.floor(h / 1) % 10
            if(i !== 0 && i !== 4) break
            index++ 
        }
        let j: number
        const c0 = re[0]
        const c1 = re[1]
        const c2 = re[2]
        switch(index){
            //+--
            case 0:
                j = Math.floor(re[0] / 1) % 10
                //上家
                if(j === 1){
                    re[0] = c1
                    re[1] = c2
                    re[2] = c0
                //対面
                }else if(j === 2){
                    re[0] = c1
                    re[1] = c0
                    re[2] = c2
                }
                break
            //-+-
            case 1:
                j = Math.floor(re[1] / 1) % 10
                //上家
                if(j === 1){
                    re[0] = c0
                    re[1] = c2
                    re[2] = c1
                //下家
                }else if(j === 3){
                    re[0] = c1
                    re[1] = c0
                    re[2] = c2
                }
                break
            //--+
            case 2:
                j = Math.floor(re[2] / 1) % 10
                //下家
                if(j === 3){
                    re[0] = c2
                    re[1] = c0
                    re[2] = c1
                //対面
                }else if(j === 2){
                    re[0] = c0
                    re[1] = c2
                    re[2] = c1
                }
                break
        }
        return re
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

    private getRichiLogo(): cc.Prefab{
        let prefab = this.controller.richiLogo
        const num = Math.floor(Math.random() * 600)
        if(num === 77) prefab = this.controller.chokuritsuLogo
        return prefab
    }
}