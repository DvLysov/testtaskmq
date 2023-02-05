class IndexedDBService {

	private db: any;

	constructor(dbName: string, dbVersion: number, dbUpgrade: Function) {
		return new Promise( (resolve, reject) => {

			this.db = null;

			// We check indexedDB support
			//@ts-ignore
			if ( !(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB) ) {
				reject('indexedDB not supported');
			}

			// We open database. dbName - name of database, dbVersion - version of database
			const dbOpen = indexedDB.open(dbName, dbVersion);

			// We set callbacks
			if (dbUpgrade) {
				dbOpen.onupgradeneeded = e => {
					dbUpgrade(dbOpen.result, e.oldVersion, e.newVersion);
				};
			}

			dbOpen.onsuccess = () => {
				this.db = dbOpen.result;
				resolve( this );
			};

			dbOpen.onerror = (e: any)  => {
				reject(`IndexedDB error: ${ e.target.errorCode }`);
			};

		}) as any;
	}

	get connection() {
		return this.db;
	}

	set(tableName: string, rowKey: any, value: any): Promise<any> {
		return new Promise((resolve, reject) => {

			const transaction = this.db.transaction(tableName, 'readwrite');
			const objectStore = transaction.objectStore(tableName);

			objectStore.put(value, rowKey);

			// We set transaction callbacks
			transaction.oncomplete = () => {
				resolve(true);
			};

			transaction.onerror = () => {
				reject(transaction.error);
			};
		});
	}

	setAll(tableName: string, data: any[], cb?: Function): Promise<any> {
		return new Promise((resolve, reject) => {

			const transaction = this.db.transaction(tableName, 'readwrite');
			const objectStore = transaction.objectStore(tableName);

			for (let j = 0; j<data.length; j++) {
				objectStore.put(data[j], data[j].t);
			}

			// We set transaction callbacks
			transaction.oncomplete = () => {
				resolve(true);
			};

			transaction.onerror = () => {
				reject(transaction.error);
			};
		});
	}

	get(tableName: string, rowKey: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(tableName, 'readonly');
			const objectStore = transaction.objectStore(tableName),

			request = objectStore.get(rowKey);

			// We set request callbacks
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	getAll(tableName: string): Promise<any> {
		return new Promise( (resolve, reject) => {
			const transaction = this.db.transaction(tableName, 'readonly');
			const objectStore = transaction.objectStore(tableName);

			if ('getAll' in objectStore) {
				objectStore.getAll().onsuccess = (event: any) => {
					resolve(event.target.result);
				};
			} else {
				let result: any[] = [];

				// We set callback
				objectStore.openCursor().onsuccess = (event: any) => {
					var cursor = event.target.result;
					if (cursor) {
						result.push(cursor.value);
						cursor.continue();
					} else {
						resolve(result);
					}
				};
			}
		});
	}
}

export default IndexedDBService;

/*
let ii = 0;

	putNext();

	function putNext() {
		if (ii < data.length) {
			console.log(data[ii]);
			objectStore.put(data[ii], 'key').onsuccess = putNext;
			++ii;
		} else {
			resolve(true);
			ii = 0;
			cb();
		}
	}
*/
