import BaseManager from '../../BaseManager'
import { CoordinatorEvent } from "./EventCoordinator"

export class EventManager extends BaseManager<string, CoordinatorEvent>
{
    public resolveID(event: any): string|null
    {
        if (event instanceof CoordinatorEvent) return event.id
        return null
    }

    public toJSON(): {[key: string]: CoordinatorEvent}
    {
        return Object.fromEntries(AppData.Adapter.EventCoordinator.Events.cache.entries())
    }
    public fromJSON(data: {[key: string]: CoordinatorEvent})
    {
        for (let pair of Object.entries(data))
        {
            this.cache.set(pair[0], pair[1])
        }
    }
}