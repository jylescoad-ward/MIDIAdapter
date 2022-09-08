import { BrowserWindow, ipcMain } from 'electron'
import * as easymidi from 'easymidi'
import { EventEmitter } from 'events'

export type Callback_Device = (device: string) => void
export type Callback_NoteOnOff = (device: string, note: easymidi.Note) => void

export interface DeviceSummary
{
    input: string[]
    output: string[]
}
export default class MIDIManager extends EventEmitter
{
    public Window: BrowserWindow
    public constructor(window: BrowserWindow)
    {
        super()
        this.Window = window
        this.InitializeEvents()

        process.on('exit', () => this.Shutdown())
        process.on('SIGINT', () => this.Shutdown())
    }

    public Devices: {
        input: {[key: string]: easymidi.Input},
        output: {[key: string]: easymidi.Output}
    } = {
        input: {},
        output: {}
    }

    protected InitializeEvents(): void
    {
        ipcMain.handle('devices:list', () => {
            return this.FetchDevices()
        })
        ipcMain.handle('manager:shutdown', () => {
            this.Shutdown()
        })
        ipcMain.handle('device:capture', (event, deviceName: string='', input: boolean=false, output:boolean=false) => {
            let returnValue = {
                input: 'Device:InvalidName',
                output: 'Device:InvalidName'
            }
            if (deviceName.length < 1)
                return returnValue

            let availableDevices = this.FetchDevices()

            if (output)
            {
                if (availableDevices.output.includes(deviceName))
                {
                    if (this.Devices.output[deviceName] == undefined)
                    {
                        this.Devices.output[deviceName] = new easymidi.Output(deviceName)
                        this.InitializeOutputDevice(deviceName)
                        returnValue.output = 'Device:Created'
                    }
                    else
                    {
                        returnValue.output = 'Device:AlreadyCaptured'
                    }
                }
                else
                {
                    returnValue.output = 'Device:NotFound'
                }
            }
            if (input)
            {
                if (availableDevices.input.includes(deviceName))
                {
                    if (this.Devices.input[deviceName] == undefined)
                    {
                        this.Devices.input[deviceName] = new easymidi.Input(deviceName)
                        this.InitializeInputDevice(deviceName)
                        returnValue.input = 'Device:Created'
                    }
                    else
                    {
                        returnValue.output = 'Device:AlreadyCaptured'
                    }
                }
                else
                {
                    returnValue.input = 'Device:NotFound'
                }
            } 
            return returnValue
        })
        ipcMain.handle('device:release', (event, deviceName: string, input: boolean=false, output:boolean=false) => {
            if (input)
            {
                if (this.Devices.input[deviceName] == undefined)
                    return 'Device:NotFound'
                this.Devices.input[deviceName].close()
                return 'Device:Release:Success'
            }
            if (output)
            {
                if (this.Devices.output[deviceName] == undefined)
                return 'Device:NotFound'
                this.Devices.output[deviceName].close()
                return 'Device:Release:Success'
            }
            return 'Device:InvalidName'
        })
    }

    public FetchDevices(): DeviceSummary
    {
        return {
            input: easymidi.getInputs(),
            output: easymidi.getOutputs()
        }
    }

    public InitializeInputDevice(deviceName: string): void
    {
        if (this.Devices.input[deviceName] == undefined) return
        let dev: any = this.Devices.input[deviceName]
        let eventChannels = [
            'noteon',
            'noteoff',
            'poly aftertouch',
            'cc',
            'program',
            'channel aftertouch',
            'pitch',
            'position',
            'mtc',
            'select',
            'clock',
            'start',
            'continue',
            'stop',
            'activatesense',
            'reset',
            'sysex'
        ]
        for (let channel of eventChannels)
        {
            dev.on(channel, (...args: any[]) => {
                this.emit(`device:input=${channel}`, ...args)
            })
        }
    }
    public InitializeOutputDevice(deviceName: string): void
    {
        if (this.Devices.output[deviceName] == undefined) return
        let dev: any = this.Devices.output[deviceName]
        let eventChannels = [
            'noteon',
            'noteoff',
            'poly aftertouch',
            'cc',
            'program',
            'channel aftertouch',
            'pitch',
            'position',
            'mtc',
            'select',
            'clock',
            'start',
            'continue',
            'stop',
            'activatesense',
            'reset'
        ]
        for (let channel of eventChannels)
        {
            this.on(`device:output=${channel}`, (deviceName: string, param: any) =>
            {
                if (dev.isPortOpen())
                    dev.send(channel, param)
            })
        }
    }

    public Shutdown(): void
    {

    }
}