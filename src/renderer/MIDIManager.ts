import {EventEmitter} from 'events'
import { CoordinatorEventOutput } from './coordinator/EventCoordinator'
import { CoordinatorEventMIDI } from './coordinator/MIDI'
import { MIDIAdapterController } from './MIDIAdapterController'
export class MIDIManager extends EventEmitter
{
    public Adapter: MIDIAdapterController
    public constructor(adapter: MIDIAdapterController)
    {
        super()
        this.Adapter = adapter
    }
    
    public async Trigger(event: CoordinatorEventMIDI): Promise<void>
    {
        this.Adapter.MIDIListener.emit(event.type.toString(), event)
    }
}