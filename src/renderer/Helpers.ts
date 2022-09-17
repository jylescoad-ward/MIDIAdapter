export function ArrayDifference<T>(from: T[], to: T[]): IArrayDifference<T>
{
    let data: IArrayDifference<T> =
    {
        removed: [],
        added: [],

        previous: from,
        current: to
    }
    for (let i of to)
        if (!from.includes(i))
            data.added.push(i)
    for (let i of from)
        if (!to.includes(i))
            data.removed.push(i)
    return data
}
export interface IArrayDifference<T>
{
    removed: T[],
    added: T[],
    previous: T[],
    current: T[]
}
export interface IDeviceSummary
{
    input: IArrayDifference<string>
    output: IArrayDifference<string>
}
export interface IJSONable<T>
{
    fromJSON(data: T): void
    toJSON(data: any): T
}