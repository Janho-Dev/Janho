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

import {kaze_number, ryukyoku} from "../utils/Types";

export interface Game {
    onTimein(time: number): void
    onHaipai(kaze: kaze_number, hai: number[], dora: number, names: {[key in kaze_number]: string}): void
    onTurn(kaze: kaze_number, n: number): void
    onTsumo(hai: number): void
    onDahai(hai: number, kaze: kaze_number, isRichi: boolean): void
    onTimeout(json: string): void
    onCandidate(json: string): void
    onChi(combi: number[], kaze: kaze_number): void
    onPon(combi: number[], kaze: kaze_number): void
    onKan(combi: number[], kaze: kaze_number): void
    onAnkan(combi: number[], kaze: kaze_number): void
    onKakan(combi: number[], kaze: kaze_number): void
    onHora(kaze: kaze_number, json: string, json2: string): void
    onRichi(hai: number, kaze: kaze_number): void
    onResetTestFunc(): void
    onRyukyoku(type: ryukyoku): void
    onRyukyokuByPlayer(kaze: kaze_number, type: ryukyoku): void
    onKantsumo(hai: number): void
    onInfo(bakaze: number, kyoku: number, homba: number, richi: number, point: number[]): void
    onEnd(): void
}