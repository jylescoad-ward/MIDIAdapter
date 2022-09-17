import * as tinytoolbox from 'tinytoolbox'
import {EventEmitter} from 'events'

import {MIDIAdapterController} from '../MIDIAdapterController'
import {EventManager} from './EventManager'

import {CoordinatorEventOBS} from './OBS'
import {CoordinatorEventMIDI} from './MIDI'

import {IJSONable} from '../Helpers'
import { EventType } from '.'

export type CoordinatorEventInput = CoordinatorEventOBS | CoordinatorEventMIDI
export type CoordinatorEventOutput = CoordinatorEventOBS | CoordinatorEventMIDI
export interface ICoordinatorEvent
{
    id: string
    label: string
    on: CoordinatorEventInput[]
    then: CoordinatorEventOutput[]
    /**
     * @summary
     * When `true`, it will fire all the `then` events without waiting. 
     * 
     * When `false`, it will fire all the `then` events synchronously.
     */
    async: boolean
}
export class CoordinatorEvent implements ICoordinatorEvent, IJSONable<ICoordinatorEvent>
{
    private Adapter: MIDIAdapterController
    public constructor(adapter: MIDIAdapterController)
    {
        this.Adapter = adapter
    }

    public id: string = ''
    public label: string = ''
    public on: CoordinatorEventInput[] = []
    public then: CoordinatorEventOutput[] = []
    /**
     * @summary
     * When `true`, it will fire all the `then` events without waiting. 
     * 
     * When `false`, it will fire all the `then` events synchronously.
     */
    public async: boolean = false

    public fromJSON(data: ICoordinatorEvent): void
    {
        Object.assign(this, data)
    }

    public toJSON(data: any={}): ICoordinatorEvent
    {
        let value: ICoordinatorEvent = Object.assign({}, {
            ...data,
            id: this.id,
            label: this.label,
            on: this.on,
            then: this.then,
            async: this.async
        })
        return value
    }

    public Trigger(caller: CoordinatorEventInput): void
    {
        this.Adapter.EventCoordinator.TriggerOutput(this, caller)
    }
}
export interface CoordinatorData
{
    events: CoordinatorEvent[]
}
export class EventCoordinator extends EventEmitter
{
    public Adapter: MIDIAdapterController
    public Data: CoordinatorData
    public constructor(data: CoordinatorData, adapter: MIDIAdapterController)
    {
        super()
        this.Adapter = adapter
        this.Data = data
        this.Events = new EventManager()
    }

    public Events: EventManager

    public CreateEvent(label: string, data?: ICoordinatorEvent)
    {
        let event = new CoordinatorEvent(this.Adapter)
        event.label = label
        event.id = tinytoolbox.stringGen(32, tinytoolbox.StringGenCharsetType.AlphaNumeric)

        if (data != null)
            event.fromJSON(data)

        this.Events.add(event, event.id)
        return this.Events.cache.get(event.id)
    }
    public RemoveEvent(id: string)
    {
        let exists = this.Events.cache.get(id)
        if (exists != undefined)
        {
            this.emit('event:remove', exists)
            this.Events.cache.delete(id)
            return true
        }
        return false
    }

    public async TriggerOutput(event: CoordinatorEvent, caller: CoordinatorEventInput): Promise<void>
    {
        let promiseArray: Promise<void>[] = []

        for (let item of event.then)
        {
            promiseArray.push(new Promise(async (resolve, reject) => {
                if (item.delay != null && typeof item.delay == 'number' && item.delay >= 0)
                    await new Promise((r) => setTimeout(r, item.delay))
                if (item.type == EventType.OBS)
                    this.Adapter.OBSManager.Trigger(item as CoordinatorEventOBS).then(resolve).catch(reject)
                else if (item.type == EventType.MIDI)
                    this.Adapter.MIDIManager.Trigger(item as CoordinatorEventMIDI).then(resolve).catch(reject)
            }))
        }

        if (event.async)
            await Promise.all(promiseArray)
        else
            await Promise.allSettled(promiseArray)
    }
}