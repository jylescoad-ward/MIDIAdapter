import { EventEmitter } from 'events'
import * as easymidi from 'easymidi'

import { ArrayDifference, IDeviceSummary } from './Helpers'
import { MIDIAdapterController } from './MIDIAdapterController'

export default class MIDIListener extends EventEmitter
{
    public Adapter: MIDIAdapterController

    public constructor(adapter: MIDIAdapterController)
    {
        super()
        this.Adapter = adapter

        this.InitializeEvents()
    }

    private deviceCheckInterval?: NodeJS.Timer

    public InputDevices: string[] = []
    public OutputDevices: string[] = []

    private async InitializeEvents()
    {
        this.deviceCheckInterval = setInterval(() => {
            let summary = this.DeviceSummary()
            let emitInput = summary.input.added.length > 0 || summary.input.removed.length > 0
            let emitOutput = summary.output.added.length > 0 || summary.output.removed.length > 0
            if (emitInput)
                this.emit('devices:input', summary.input)
            if (emitOutput)
                this.emit('devices:output', summary.output)
            
            if (emitInput || emitOutput)
                this.emit('devices', this.DeviceSummary())
        }, 1000)
    }

    public Destroy(): void
    {
        if (this.deviceCheckInterval != null)
            clearInterval(this.deviceCheckInterval)
    }

    public DeviceSummary(): IDeviceSummary
    {
        let inputs = easymidi.getInputs()
        let inputData = ArrayDifference<string>(this.InputDevices, inputs)

        
        let outputs = easymidi.getOutputs()
        let outputData = ArrayDifference<string>(this.OutputDevices, outputs)
        
        this.InputDevices = inputs
        this.OutputDevices = outputs
        
        return {
            input: inputData,
            output: outputData
        }
    }

}