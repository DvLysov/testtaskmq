
import IndexedDBService from './IndexedDBService';

export class StateService {

	static dbName = 'stateDB';
	static dbVersion = 1;
	static DB: any = null;
	static target = new EventTarget();

	private updateCallback: Function | void = () => {};
	private observed: any;

	constructor(observed: any, updateCallback?: Function) {
		this.updateCallback = updateCallback;
		this.observed = new Set(observed);
		StateService.target.addEventListener('set', (e: any) => {
			if (this.updateCallback && this.observed.has( e.detail.name )) {
				this.updateCallback(e.detail.name, e.detail.value);
			}
		});

		StateService.target.addEventListener('setAll', (e: any) => {
			if (this.updateCallback) {
				this.updateCallback(e.detail.name, e.detail.value);
			}
		});
	}

	async dbConnect(tableName: string) {
		if (StateService.DB) {
			return StateService.DB;
		}
		StateService.DB = await new IndexedDBService(
			StateService.dbName,
			StateService.dbVersion,
			(db: any, oldVersion: number, newVersion: number) => {
				switch (oldVersion) {
					case 0: {
						// Первый прибор для измерения температуры изобрёл Галилей.
						db.createObjectStore("temperature");
						db.createObjectStore("precipitation");
					}
					default: {

					}
				}
			}
		);

		return StateService.DB;
	}

	async set(tableName: string, rowKey: any, value: any) {
		this.observed.add(rowKey);
		const db: any = await this.dbConnect(tableName);
		await db.set(tableName, rowKey, value);
		const event = new CustomEvent('set', { 
			detail: {
				tableName,
				name: rowKey, 
				value 
			} 
		});
		StateService.target.dispatchEvent(event);
	}

	async setAll(tableName: string, data: any[]) {
		const db: any = await this.dbConnect(tableName);
		await db.setAll(tableName, data);
		const event = new CustomEvent('setAll', { 
			detail: {
				tableName,
				data,
			} 
		});
		StateService.target.dispatchEvent(event);
	}

	async get(tableName: string, rowKey: any) {
		this.observed.add(rowKey);
		const db: any = await this.dbConnect(tableName);
		return await db.get(tableName, rowKey);
	}

	async getAll(tableName: string) {
		const db: any = await this.dbConnect(tableName);
		return await db.getAll(tableName);
	}
}

export default StateService;
