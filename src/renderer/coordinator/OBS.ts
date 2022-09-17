import {EventInputGeneric} from '.'

export interface CoordinatorEventOBSData
{
    event: string
    data: any
}
export interface CoordinatorEventOBS extends EventInputGeneric<CoordinatorEventOBSData>
{}