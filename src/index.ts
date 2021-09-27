import OBSWebSocket from 'obs-websocket-js'
import { DanmuPool } from './DanmuPool'
import { RandomDanmu } from './RandomDanmu'

const obs = new OBSWebSocket()
obs.connect({
  address: 'localhost:4444',
  password: 'password'
}).then(() => {
  console.log('Connected to OBS')
  // @ts-ignore TS2339
  global.danmuPool = new DanmuPool(obs, 'danmu', { width: 1920, height: 1080 }, 50)
  setInterval(() => {
    // @ts-ignore TS2339
    global.danmuPool.update()
  }, 1000 / 30)
})

// @ts-ignore TS2339
global.obs = obs
// @ts-ignore TS2339
global.RandomDanmu = RandomDanmu
