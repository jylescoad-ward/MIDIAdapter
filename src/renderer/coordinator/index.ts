export enum EventType
{
    OBS,
    MIDI,
    Shutdown,
    Initialize
}
export interface EventInputGeneric<T>
{
    type: EventType
    data: T
    /**
     * @summary
     * Measured in milliseconds
     */
    delay: number
}
