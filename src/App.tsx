import { useState, useEffect, useRef, useReducer } from 'react';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Layout, Select, Spin } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

import './app.css';

import DataService from './services/DataService';
import StateService from './services/StateService';
import type { ItemData } from './types';
import { EMode, TOptions } from './types';

import { getOptions } from './utils';

const HEADER_PART_STYLE = {
	flex: 1, 
	minWidth: 220,
}

const DEFAULT_BTN_PROPS = {
	size: "large",
	block: true,
	className: "app__side-menu--btn",
}

const DEFAULT_SELECT_PROPS = {
	style: { 
		width: '100%', 
		minWidth: 220 
	},
}
// Sometimes we use @ts-ignore to simplify the programming process
function App() {

	// The App has two different modes: EMode.temperature and EMode.precipitation
	const [mode, setMode] = useState<EMode>(EMode.temperature);
	const modeRef = useRef<EMode>(EMode.temperature);

	// The App has preloader and two selects for period selection
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [fromYear, setFromYear] = useState<number | null>(null);
	const [toYear, setToYear] = useState<number | null>(null);
	const [temperatureOptions, setTemperatureOptions ] = useState<TOptions>([]);
	const [precipitationOptions,  setPrecipitationOptions ] = useState<TOptions>([]);

	// The main data of app are:
	const [temperature, setTemperature] = useState<ItemData[]>([]);
	// Самые крупные дождевые капли в истории – не больше 7 мм в диаметре.
	const [precipitation, setPrecipitation] = useState<ItemData[]>([]);

	const temperatureStateRef = useRef<any>(null);
	const precipitationStateRef = useRef<any>(null);

	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		temperatureStateRef.current = new StateService([EMode.temperature], () => {
			forceUpdate();
		} );
		precipitationStateRef.current = new StateService([EMode.precipitation], () => {
			forceUpdate();
		} );
	}, [])

	useEffect(() => {
		(async () => {
			setIsFetching(true);

			let data: any;

			const tdb: any = await temperatureStateRef.current.getAll(EMode.temperature) || [];
			const pdb: any = await precipitationStateRef.current.getAll(EMode.precipitation) || [];

			const cond1 = Array.isArray(tdb) && tdb.length > 0 && modeRef.current === EMode.temperature ? true : false;
			const cond2 = Array.isArray(pdb) && pdb.length > 0 && modeRef.current === EMode.precipitation ? true : false;

			if (cond1 || cond2) {

				// It's time to get data from IndexDB:

				if (modeRef.current === EMode.temperature) {
					data = tdb;

					const from =  moment(data[0].t, "YYYY-MM-DD").year();
					const to = moment(data[data.length-1].t, "YYYY-MM-DD").year();

					const options = getOptions(to - from, from);

					setTemperatureOptions(options);

					setFromYear(from);
					setToYear(to);

					setTemperature(data);

				} else if (modeRef.current === EMode.precipitation) {
					data = pdb;

					const from =  moment(data[0].t, "YYYY-MM-DD").year();
					const to = moment(data[data.length-1].t, "YYYY-MM-DD").year();;
					const options = getOptions(to - from, from);

					setPrecipitationOptions(options);

					setFromYear(from);
					setToYear(to);

					setPrecipitation(data);

				}

			} else {

				// It's time to fetch data from backend:

				if (modeRef.current === EMode.temperature) {
					data = await DataService.getTemperature();

					const from =  moment(data[0].t, "YYYY-MM-DD").year();
					const to = moment(data[data.length-1].t, "YYYY-MM-DD").year();

					const options = getOptions(to - from, from);

					setTemperatureOptions(options);

					setFromYear(from);
					setToYear(to);

					setTemperature(data);

					await temperatureStateRef.current.setAll(EMode.temperature, data);

				} else if (modeRef.current === EMode.precipitation) {
					data = await DataService.getPrecipitation();

					const from =  moment(data[0].t, "YYYY-MM-DD").year();
					const to = moment(data[data.length-1].t, "YYYY-MM-DD").year();;
					const options = getOptions(to - from, from);

					setPrecipitationOptions(options);

					setFromYear(from);
					setToYear(to);

					setPrecipitation(data);

					await precipitationStateRef.current.setAll(EMode.precipitation, data);
				}

			}

			setIsFetching(false);
		})();
	}, [mode]); 

	const handleModeBtnClick = (mode: EMode): void => {
		//@ts-ignore
		modeRef.current = mode;
		setMode(mode);
	}

	const handleFromYearChange = (v: number) => 
		setFromYear(v);

	const handleToYearChange = (v: number) => 
		setToYear(v);

	let options: any = [];


	// We choose options which depends upon current mode
	if (mode === EMode.temperature) {
		options = temperatureOptions;
	} else if (mode === EMode.precipitation) {
		options = precipitationOptions;
	}

	// It's time to render result:
	return (
		<Layout >
			<Sider theme="light" className="app__side-menu" style={{height: '100vh'}}>
				<div style={{height: 64}}></div>
				<Button 
					{...DEFAULT_BTN_PROPS}
					type={ mode === EMode.temperature ? "primary" : void 0 }
					onClick={ () => handleModeBtnClick(EMode.temperature) }
					disabled={isFetching}
				>
					Temperature
				</Button>
				<Button 
					{...DEFAULT_BTN_PROPS}
					type={ mode === EMode.precipitation ? "primary" : void 0 }
					onClick={ () => handleModeBtnClick(EMode.precipitation) }
					disabled={isFetching}
				>
					Precipitation
				</Button>
			</Sider>
			<Layout style={{height: '100vh', minWidth: 440}}>
				<Header className="app__header">
					<div style={HEADER_PART_STYLE}>
						<Select
							{...DEFAULT_SELECT_PROPS}
							placeholder="Select FROM date..."
							value={fromYear}
							onChange={handleFromYearChange}
							disabled={isFetching}
						> 
							{ (options || []).map( (item: any) => (
								<Option
									key={`from-option_${item}`}
									title={item}
									value={item}
									disabled={toYear && item >= toYear ? true : false}
								>
									{item}
								</Option>
							))}
						</Select>
					</div>
					<div style={HEADER_PART_STYLE}>
						<Select
							{...DEFAULT_SELECT_PROPS}
							placeholder="Select TO date..."
							value={toYear}
							onChange={ handleToYearChange}
							disabled={isFetching}
						> 
							{ (options || []).map( (item: any) => (
								<Option
									key={`from-option_${item}`}
									title={item}
									value={item}
									disabled={fromYear && item <= fromYear ? true : false}
								>
									{item}
								</Option>
							))}
						</Select>
					</div>
				</Header>
				<Content className="app__content">

					{ isFetching ?
						<div 
							className="app__content-loader"
						>
							<Spin 
								size="large"
								tip="Loading..."
								indicator={antIcon} 
							/>
						</div>
						
						:
						null
					}

					{ mode === EMode.temperature && !isFetching ?
						<div>
							{mode} data length: {temperature.length}
						</div>
						:
						null
					}

					{ mode === EMode.precipitation && !isFetching ?
						<div>
							{mode} data length: {precipitation.length}
						</div>
						:
						null
					}

				</Content>
				<Footer className="app__footer">
					<div style={{padding: 20, width: '100%', textAlign: 'center'}}>
						Changes in temperature and precipitation in recent years.
					</div>
				</Footer>
			</Layout>
		</Layout>
	);
}

export default App;
