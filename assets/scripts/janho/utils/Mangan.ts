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

import {mangan} from "./Types";

export class Mangan{
    static getString(fu: number, han: number, yakuman: number): mangan{
        let string: mangan = "無し"
        if(han === 3 && fu >= 70) string = "満貫"
        if(han === 4 && fu >= 40) string = "満貫"
        if(han === 6 || han === 7) string = "跳満"
        if(han >= 8 && han <= 10) string = "倍満"
        if(han >= 11 && han <= 12) string = "三倍満"
        if(han >= 13) string = "数え役満"

        if(yakuman === 1) string = "役満"
        if(yakuman === 2) string = "二倍役満"
        if(yakuman === 3) string = "三倍役満"
        if(yakuman === 4) string = "四倍役満"
        if(yakuman === 5) string = "五倍役満"
        if(yakuman === 6) string = "六倍役満"
        return string
    }
}