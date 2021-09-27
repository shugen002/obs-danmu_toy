import { randomBytes } from 'crypto'
import OBSWebSocket from 'obs-websocket-js'

export class Danmu {
  socket: OBSWebSocket
  scene: string
  name: string
  x:number=0
  y: number=0
  width:number=0
  time:number=0
  created=false
  constructor (socket:OBSWebSocket, scene:string, name?:string) {
    this.socket = socket
    this.scene = scene
    if (name) {
      this.name = name
    } else {
      this.name = 'Danmu' + randomBytes(4).toString('hex')
    }
  }

  async use (text:string, trackY: number) {
    this.y = trackY
    this.time = Date.now()
    if (this.created) {
      await this.socket.send('SetSourceSettings', {
        sourceName: this.name,
        sourceSettings: {
          text: text
        }
      })
    } else {
      await this.socket.send('CreateSource', {
        sceneName: this.scene,
        sourceName: this.name,
        sourceKind: 'text_gdiplus_v2',
        sourceSettings: {
          text: text,
          font: {
            face: '贤二体',
            size: 50
          },
          outline: true,
          outline_color: 4278190080,
          outline_opacity: 60,
          outline_size: 5
        },
        setVisible: false
      })
      this.created = true
    }
    await this.socket.send('SetSceneItemProperties', {
      'scene-name': this.scene,
      item: {
        name: this.name
      },
      position: {
        x: 1920,
        y: this.y
      },
      scale: {
        x: 1,
        y: 1
      },
      visible: true,
      crop: {},
      rotation: 0,
      bounds: {}
    })
    // 预定一个宽度，等200ms后从OBS拉取实际宽度
    this.width = text.length * 50
    setTimeout(async () => {
      const e = await this.socket.send('GetSceneItemProperties', {
        'scene-name': this.scene,
        item: {
          name: this.name
        }
      })
      this.width = e.width
    }, 200)
  }

  update (now:number):boolean {
    this.x = 1920 - (now - this.time) / 1000 * 50
    if (this.x < -this.width) {
      this.socket.send('SetSceneItemProperties', {
        'scene-name': this.scene,
        item: {
          name: this.name
        },
        position: {
          x: 1920,
          y: this.y
        },
        scale: {
          x: 1,
          y: 1
        },
        visible: false,
        crop: {},
        rotation: 0,
        bounds: {}
      }).then(() => {}).catch(console.error)
      return false
    }
    this.socket.send('SetSceneItemProperties', {
      'scene-name': this.scene,
      item: {
        name: this.name
      },
      position: {
        x: this.x,
        y: this.y
      },
      scale: {
        x: 1,
        y: 1
      },
      visible: true,
      crop: {},
      rotation: 0,
      bounds: {}
    }).then(() => {}).catch(console.error)
    return true
  }
}
