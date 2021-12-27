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
    private back = "green"
    anim = cc.repeatForever(cc.sequence(cc.delayTime(0.5), cc.fadeOut(1.0), cc.delayTime(0.5), cc.fadeIn(1.0)))

    @property(cc.Node)
    tehai: cc.Node = null
    @property(cc.Prefab)
    tsumohai: cc.Prefab = null
    @property(cc.Prefab)
    nakihai_node: cc.Prefab = null

    @property(cc.Node) kamiTehai: cc.Node = null
    @property(cc.Node) simoTehai: cc.Node = null
    @property(cc.Node) toiTehai: cc.Node = null

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
    @property(cc.Label) roundLabel: cc.Label = null
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
    @property(cc.Button) richiButton: cc.Button = null
    @property(cc.Button) ryukyokuButton: cc.Button = null

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

    @property(cc.Node) tenbou: cc.Node = null
    @property(cc.Node) kamiTenbou: cc.Node = null
    @property(cc.Node) toiTenbou: cc.Node = null
    @property(cc.Node) simoTenbou: cc.Node = null

    @property(cc.Label) tensu: cc.Label = null
    @property(cc.Label) kamiTensu: cc.Label = null
    @property(cc.Label) toiTensu: cc.Label = null
    @property(cc.Label) simoTensu: cc.Label = null

    @property(cc.Node) logoNode: cc.Node = null
    @property(cc.Node) kamiLogoNode: cc.Node = null
    @property(cc.Node) simoLogoNode: cc.Node = null
    @property(cc.Node) toiLogoNode: cc.Node = null

    @property(cc.Prefab) chiLogo: cc.Prefab = null
    @property(cc.Prefab) kanLogo: cc.Prefab = null
    @property(cc.Prefab) ponLogo: cc.Prefab = null
    @property(cc.Prefab) ronLogo: cc.Prefab = null
    @property(cc.Prefab) tsumoLogo: cc.Prefab = null
    @property(cc.Prefab) richiLogo: cc.Prefab = null
    @property(cc.Prefab) chokuritsuLogo: cc.Prefab = null

    @property(cc.Node) doraNode: cc.Node = null

    @property(cc.Prefab) ryukyokuNode: cc.Prefab = null

    @property(cc.Prefab) chiNode: cc.Prefab = null
    @property(cc.Prefab) chiCombiNode: cc.Prefab = null

    @property(cc.Prefab) manganLogo: cc.Prefab = null
    @property(cc.Prefab) hanemanLogo: cc.Prefab = null
    @property(cc.Prefab) baimanLogo: cc.Prefab = null
    @property(cc.Prefab) sanbaimanLogo: cc.Prefab = null
    @property(cc.Prefab) kazoeLogo: cc.Prefab = null
    @property(cc.Prefab) yakumanLogo: cc.Prefab = null
    @property(cc.Prefab) nibaiLogo: cc.Prefab = null
    @property(cc.Prefab) sanbaiLogo: cc.Prefab = null
    @property(cc.Prefab) yonbaiLogo: cc.Prefab = null
    @property(cc.Prefab) gobaiLogo: cc.Prefab = null
    @property(cc.Prefab) rokubaiLogo: cc.Prefab = null
    @property(cc.Prefab) nagashiLogo: cc.Prefab = null

    @property(cc.Prefab) optionNode: cc.Prefab = null

    @property(cc.Prefab) yakuLabel: cc.Prefab = null

    @property(cc.Prefab) pointTemp: cc.Prefab = null

    @property(cc.SpriteFrame) greenBack: cc.SpriteFrame = null
    @property(cc.SpriteFrame) blackBack: cc.SpriteFrame = null
    @property(cc.SpriteFrame) blueBack: cc.SpriteFrame = null

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
        this.amariLabel.string = "しばらくお待ち下さい"
        this.amariLabel.node.runAction(this.anim)
        this.parent.getProtocol().emit("startRoom", {"protocol": "startRoom", "bool": true}, false)
        this.light.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.kamiLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.simoLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.toiLight.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.2), cc.fadeOut(0.4), cc.delayTime(0.2), cc.fadeIn(0.4))))
        this.light.active = false
        this.kamiLight.active = false
        this.simoLight.active = false
        this.toiLight.active = false

        const self = this
        this.node.getChildByName("Option Button").on(cc.Node.EventType.TOUCH_END, () => {
            self.getParent().playSound("click")
            const go = self.game.getOption()
            self.node.getChildByName("Option Button").active = false

            const option = cc.instantiate(self.optionNode)
            option.getChildByName("Close").on(cc.Node.EventType.TOUCH_END, () => {
                self.getParent().playSound("click")
                self.node.removeChild(self.node.getChildByName("Option Node"))
                self.node.getChildByName("Option Button").active = true
            }, this)

            const bc = option.getChildByName("Back Button")
            bc.on(cc.Node.EventType.TOUCH_END, () => {
                if(self.back === "green"){
                    self.back = "blue"
                    self.node.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = self.blueBack
                }else if(self.back === "blue"){
                    self.back = "black"
                    self.node.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = self.blackBack
                }else{
                    self.back = "green"
                    self.node.getChildByName("Background").getComponent(cc.Sprite).spriteFrame = self.greenBack
                }
            }, this)

            const dt = option.getChildByName("Dahai Toggle")
            dt.getComponent(cc.Toggle).isChecked = go.auto_dahai
            dt.on("toggle", () => {
                self.game.changeOption("auto_dahai", dt.getComponent(cc.Toggle).isChecked)
            }, this)

            const ht = option.getChildByName("Hora Toggle")
            ht.getComponent(cc.Toggle).isChecked = go.auto_hora
            ht.on("toggle", () => {
                self.game.changeOption("auto_hora", ht.getComponent(cc.Toggle).isChecked)
            }, this)

            const ft = option.getChildByName("Furo Toggle")
            ft.getComponent(cc.Toggle).isChecked = go.disable_furo
            ft.on("toggle", () => {
                self.game.changeOption("disable_furo", ft.getComponent(cc.Toggle).isChecked)
            }, this)

            self.node.addChild(option)
        }, this)
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