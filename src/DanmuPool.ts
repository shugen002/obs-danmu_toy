import OBSWebSocket from 'obs-websocket-js'
import { Danmu } from './Danmu'

interface Track extends Array<Danmu>{
  y:number
}

export class DanmuPool {
  idle: Danmu[] = [];
  tracks: Array<Track> = [];
  socket:OBSWebSocket;
  screenSize:{width:number, height:number}
  fontSize:number
  scene:string
  constructor (socket:OBSWebSocket, scene:string, screenSize:{width:number, height:number}, fontSize:number) {
    this.socket = socket
    this.screenSize = screenSize
    this.fontSize = fontSize
    this.scene = scene
    const trackNum = Math.floor(screenSize.height / fontSize)
    for (let i = 0; i < trackNum; i++) {
      const track:any = []
      track.y = i * fontSize
      this.tracks[i] = track
    }
  }

  async add (text:string, color:string) {
    const track = this.getEmptyTrack()
    if (track !== null) {
      const danmu = this.getUnusedDanmu()
      await danmu.use(text, track.y)
      track.push(danmu)
    }
  }

  update () {
    const now = Date.now()
    this.tracks.forEach(track => {
      const done = track.filter(danmu => !danmu.update(now))
      done.forEach(danmu => {
        this.idle.push(danmu)
        track.splice(track.indexOf(danmu), 1)
      })
    })
  }

  getEmptyTrack ():Track|null {
    for (let i = 0; i < this.tracks.length; i++) {
      if (this.checkTrack(i)) {
        return this.tracks[i]
      }
    }
    return null
  }

  checkTrack (track:number) {
    if (this.tracks[track].length > 0) {
      if (this.tracks[track][this.tracks[track].length - 1].x + this.tracks[track][this.tracks[track].length - 1].width < 1920) {
        return true
      }
      return false
    } else {
      return true
    }
  }

  getUnusedDanmu ():Danmu {
    if (this.idle.length > 0) {
      return this.idle.pop() as Danmu
    } else {
      return new Danmu(this.socket, this.scene)
    }
  }
}
