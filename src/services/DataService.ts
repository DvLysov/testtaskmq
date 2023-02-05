import { getData } from './Api';

/*
	DataService class has two methods.
	One for temperature fetching.
	One for precipitation fetching.
*/
class DataService {
	getTemperature() {
		return getData('../data/temperature.json');
	}
	getPrecipitation() {
		return getData('../data/precipitation.json');
	}
}

export default new DataService();