import * as path from 'path'
import * as fs from 'fs'
import Configuration from './Configuration'
export interface IConfigTemplate<T>
{
    filename: string
    key: string
    data: any
}
export const configStoreProfiles: IConfigTemplate<any>[] = [
    {
        filename: 'obs.json',
        key: 'OBS',
        data: {
            address: '127.0.0.1:4444',
            secure: false,
            password: ''
        }
    }
]

export function Initialize()
{
    for (let item of configStoreProfiles)
    {
        let location = path.join(AppData.ConfigDirectory, item.filename)

        if (!fs.existsSync(location))
            fs.writeFileSync(location, JSON.stringify(item.data, null, '    '))

        if (global.AppData.CloudConfig[item.key] == undefined)
            global.AppData.CloudConfig[item.key] = new Configuration(location)
        global.AppData.CloudConfig[item.key].default(item.data)
        global.AppData.CloudConfig[item.key].write()
    }
}