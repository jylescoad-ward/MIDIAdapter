import {EventEmitter} from 'events'
import { CoordinatorEventOutput } from './coordinator/EventCoordinator'
import { CoordinatorEventOBS } from './coordinator/OBS'
import { MIDIAdapterController } from './MIDIAdapterController'
import OBSWebSocket from 'obs-websocket-js';

export interface SceneItem extends OBSWebSocket.SceneItem
{
    SceneName: string
}
export interface IOBSCache
{
    CollectionSoucres: SceneItem[]
    Scenes: OBSWebSocket.Scene[]
    CollectionScenes: {[key: string]: OBSWebSocket.Scene}
    Sources: { name: string; typeId: string; type: string }[]
    SceneItems: {
        itemId: number
        sourceKind: string
        sourceName: string
        sourceType: string
    }[],
    Transitions: { name: string }[]
}

export class OBSManager extends EventEmitter
{
    public Adapter: MIDIAdapterController
    public Client: OBSWebSocket
    public constructor(adapter: MIDIAdapterController)
    {
        super()
        this.Adapter = adapter

        this.Client = new OBSWebSocket();
    }

    public Cache: IOBSCache = {
        CollectionSoucres: [],
        CollectionScenes: {},
        Sources: [],
        SceneItems: [],
        Scenes: [],
        Transitions: []
    }

    private CacheInterval?: NodeJS.Timer

    public async Connect()
    {
        await this.Client.connect({
            address: AppData.CloudConfig.OBS._data.address,
            password: AppData.CloudConfig.OBS._data.password
        })
        await this.UpdateCache()
        if (this.CacheInterval == null)
            clearInterval(this.CacheInterval)
        this.CacheInterval = setInterval(() => {
            this.UpdateCache()
        }, 1000)
    }

    public async Disconnect()
    {
        this.Client.disconnect()
        if (this.CacheInterval != null)
            clearInterval(this.CacheInterval)
    }

    public async UpdateCache(): Promise<void>
    {
        this.Cache.Sources = (await this.Client.send('GetSourcesList')).sources
        this.Cache.SceneItems = (await this.Client.send('GetSceneItemList', {})).sceneItems
        this.Cache.Scenes = (await this.Client.send('GetSceneList')).scenes
        this.Cache.Transitions = (await this.Client.send('GetTransitionList')).transitions


        this.Cache.CollectionSoucres = [];
        this.Cache.Scenes.forEach((SceneObject)=>{
            this.Cache.CollectionScenes[SceneObject.name] = SceneObject
            
            SceneObject.sources.forEach((SourceObject)=>{
                let item: SceneItem = {
                    ...SourceObject,
                    SceneName: SceneObject.name
                }
                this.Cache.CollectionSoucres[SourceObject.id] = item
            })
        })
    }

    public async Trigger(event: CoordinatorEventOBS): Promise<void>
    {
        let eventData = event.data

        switch (eventData.event)
        {
            case "SetPreviewScene":
                await this.Client.send('SetPreviewScene', {
                    'scene-name': eventData.data as string
                })
                return;
                break;
            case "SetCurrentScene":
                await this.Client.send('SetCurrentScene', {
                    'scene-name': eventData.data as string
                })
                return;
                break;
            case "TransitionToProgram":
                await this.Client.send('EnableStudioMode')
                await this.Client.send('TransitionToProgram', {})
                return;
                break;
            case "StudioModeState":
                if (eventData.data as boolean)
                    await this.Client.send('EnableStudioMode')
                else
                    await this.Client.send('DisableStudioMode')
                return;
                break;
            case "ToggleMute":
                await this.Client.send('ToggleMute', {
                    source: eventData.data as string
                })
                return;
                break;
        }
        if (eventData.event.match(/^SetMute=(true|false)$/) != null)
        {
            await this.Client.send('SetMute', {
                source: eventData.data as string,
                mute: eventData.event.split('=')[1] == 'true'
            })
            return;
        }
        if (eventData.event.endsWith('Recording'))
        {
            await this.Client.send(eventData.event as any)
            return;
        }
        if (eventData.event.match(/^(Start|Stop|StartStop)Streaming$/) != null)
        {
            await this.Client.send(eventData.event as any)
            return;
        }

        if (eventData.event.match(/^SetSourceVisibility=(true|false|toggle)$/) != null)
        {
            let type = eventData.event.split('=')[1]
            let item = this.Cache.CollectionSoucres.find(s => s != undefined && s.name == eventData.data)
            if (item == undefined) return
            switch (type)
            {
                case "true":
                    await this.Client.send("SetSceneItemRender",{
						item: item.id,
						"scene-name": item.SceneName,
						source: eventData.data,
						render:true
					})
                    return;
                    break;
                case "false":
                    await this.Client.send("SetSceneItemRender",{
                        item: item.id,
                        "scene-name": item.SceneName,
                        source: eventData.data,
                        render: false
                    })
                    return;
                    break;
                case "toggle":
                    let SceneItem = await this.Client.send('GetSceneItemProperties', {
						item: {
							name: eventData.data,
							id: item.id
						},
						"scene-name":item.SceneName,
                    })
                    let res = await this.Client.send("SetSceneItemRender",{
                        item: item.id,
                        "scene-name": item.SceneName,
                        source: eventData.data,
                        render: !SceneItem.visible
                    })
                    console.debug(`SetSceneItemRender`, res)
                    return;
                    break;
            }
        }
    }
}