import { existsSync, mkdirSync } from 'fs'
import * as path from 'path'
import { MIDIAdapterController } from './MIDIAdapterController'
const AppData = {
    ConfigDirectory: path.join(process.cwd(), 'AppConfig'),
    CloudConfig: {},
    Adapter: null
}
if (!existsSync(AppData.ConfigDirectory))
    mkdirSync(AppData.ConfigDirectory, { recursive: true })
global.AppData = AppData
global.AppData.Adapter = new MIDIAdapterController()

require('./ConfigInit').Initialize()