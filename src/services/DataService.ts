import { getData } from './Api';

class DataService {
	getTemperature() {
		return getData('../data/temperature.json');
	}
	getPrecipitation() {
		return getData('../data/precipitation.json');
	}
}

export default new DataService();