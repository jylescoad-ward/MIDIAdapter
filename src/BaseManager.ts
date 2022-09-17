import { Collection } from "@discordjs/collection"
export default class BaseManager<K, V>
{
    public constructor(holds?: any)
    {
        Object.defineProperty(this, 'holds', { value: holds })
        this.cache = new Collection<K, V>()
    }

    public cache: Collection<K, V>
    public cacheType = typeof Collection

    public add(data: V, key: K, cache: boolean=true)
    {
        let exists = this.cache.get(key)
        if (exists && cache)
            this.cache.set(key, data)
        if (exists)
            return exists
        this.cache.set(key, data)
        return this.cache.get(key)
    }
    public remove(key: K)
    {
        let exists = this.cache.get(key)
        if (!exists)
            return false
        this.cache.delete(key)
        return true
    }
    public valueOf()
    {
        return this.cache
    }
}