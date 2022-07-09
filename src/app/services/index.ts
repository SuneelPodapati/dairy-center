export * from './producer.service'
export * from './procurement.service'
export * from './spinner.interceptor'
export * from './app.store'

export default class Upsert<T>{
    updateOne: {
        filter: {
            _id?: string
        };
        update: T;
        upsert: boolean
    } = undefined;
    insertOne: {
        document: T
    } = undefined

    constructor(id: string, dataItem: T) {
        if (id) {
            this.updateOne = {
                filter: {
                    _id: id
                },
                update: dataItem,
                upsert: true
            }
        }
        else {
            this.insertOne = { document: dataItem }
        }
    }
}