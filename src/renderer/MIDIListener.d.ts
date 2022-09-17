import { EventEmitter } from 'events'
import { IArrayDifference, IDeviceSummary } from './Helpers'

export default class MIDIListener extends EventEmitter
{
    on(evt: 'devices',handler: (devices: IDeviceSummary) => void): this
    on(evt: 'devices:input', handler: (inputDevices: IArrayDifference<string>) => void): this
    on(evt: 'devices:output', handler: (inputDevices: IArrayDifference<string>) => void): this
    
    private deviceCheckInterval?: NodeJS.Timer

    public InputDevices: string[]
    public OutputDevices: string[]

    private InitializeEvents(): Promise<void>
    public Destroy(): void

    public DeviceSummary(): IDeviceSummary
}