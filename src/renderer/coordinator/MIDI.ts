import {EventInputGeneric} from '.'

export type MIDIEvent_IO = 'noteon'|'noteoff'
export interface CoordinatorEventMIDIData
{
    controller: string
    /**
     * @summary
     * When null, it doesn't matter that note it requires
     */
    note: number|null
    /**
     * @summary
     * When null, it doesn't matter that velocity it requires
     */
    velocity: number|null
    /**
     * @summary
     * When null, it doesn't matter what channel it was fired on
     */
    channel: number|null
    type: MIDIEvent_IO
}
export interface CoordinatorEventMIDI extends EventInputGeneric<CoordinatorEventMIDIData>
{}