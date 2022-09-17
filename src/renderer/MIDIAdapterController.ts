import { EventEmitter } from 'events'

import { EventCoordinator } from "./coordinator/EventCoordinator"
import MIDIListener from "./MIDIListener"

import {MIDIManager} from './MIDIManager'
import {OBSManager} from './OBSManager'

export class MIDIAdapterController extends EventEmitter
{
    public constructor()
    {
        super()

        this.EventCoordinator = new EventCoordinator({
            events: []
        }, this)
        this.MIDIListener = new MIDIListener(this)

        this.OBSManager = new OBSManager(this)
        this.MIDIManager = new MIDIManager(this)
    }

    public EventCoordinator: EventCoordinator
    public MIDIListener: MIDIListener

    public OBSManager: OBSManager
    public MIDIManager: MIDIManager
}