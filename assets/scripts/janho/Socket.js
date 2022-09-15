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

export class Socket{

    constructor(parent){
        this.parent = parent
        //this.socket = io.connect("url", {transports: ["polling"]})
        this.socket = io.connect("http://localhost:3000/")

        const self = this

        this.socket.on("connect", function () {
            self.parent.isConnected = true
        })
        this.socket.on("janho", function(data){
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    self.parent.onReceive(data)
                }, 1)
            }).catch(() => {
                console.error("Error: socket.io receive error.")
            })
        })
        this.socket.on("disconnect", function () {
            self.parent.isConnected = false
            self.parent.onDisconnect()
        })
    }

    emit(data){
        new Promise((resolve, reject) => {
            setTimeout(() => {
                this.socket.emit("janho", data)
            }, 1)
        }).catch(() => {
            console.error("Error: socket.io emit error.")
        })
    }
}