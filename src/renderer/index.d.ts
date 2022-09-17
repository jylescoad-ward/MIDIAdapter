import {MIDIAdapterController} from './MIDIAdapterController'
import Configuration, { IConfiguration } from './Configuration'
import {IConfig_AuthProfile} from './ConfigTemplate'
declare interface ICloudConfig 
{
    OBS: IConfiguration<IConfig_AuthProfile>
}
declare interface IAppData
{
    Adapter: MIDIAdapterController
    CloudConfig: ICloudConfig & {[key: string]: Configuration}
    ConfigDirectory: string
}
declare global
{
    var AppData: IAppData
}
export {}