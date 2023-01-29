import { useState, useEffect, useRef } from 'react';
import { Button, Layout, Select } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const { Option } = Select;

import './app.css';

import DataService from './services/DataService';
import type { ItemData } from './types';
import { EMode } from './types';


function App() {
    const [mode, setMode] = useState<EMode>(EMode.temperature);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [fromYear, setFromYear] = useState<number | null>(null);
    const [toYear, setToYear] = useState<number | null>(null);

    const [temperature, setTemperature] = useState<ItemData[]>([]);
    const [precipitation, setPrecipitation] = useState<ItemData[]>([]);

    const modeRef = useRef<EMode>(EMode.temperature);

    useEffect(() => {
        (async () => {
            setIsFetching(true);

            //<ItemData>

            let data: any;

            const cond = false;

            if (cond) {

            } else {

                if (modeRef.current === EMode.temperature) {
                    data = await DataService.getTemperature();
                    setTemperature(data);
                } else if (modeRef.current === EMode.precipitation) {
                    data = await DataService.getPrecipitation();
                    setPrecipitation(data);
                }

            }

            setIsFetching(false);
        })();
    }, [mode, fromYear, toYear]);

    const handleModeBtnClick = (mode: EMode): void => {
        //@ts-ignore
        modeRef.current = mode;
        setMode(mode)
    }

    const from = [ 
        {
            id: 1,
            value: '1'
        } 
    ]

    return (
        <Layout >
            <Sider theme="light" className="app__side-menu" style={{height: '100vh'}}>
                <div style={{height: 64}}></div>
                <Button 
                    size="large"
                    type={ mode === EMode.temperature ? "primary" : void 0 }
                    block
                    className="app__side-menu--btn"
                    onClick={ () => handleModeBtnClick(EMode.temperature) }
                    disabled={isFetching}
                >
                    Температура
                </Button>
                <Button 
                    size="large"
                    type={ mode === EMode.precipitation ? "primary" : void 0 }
                    block
                    className="app__side-menu--btn"
                    onClick={ () => handleModeBtnClick(EMode.precipitation) }
                    disabled={isFetching}
                >
                    Осадки
                </Button>
            </Sider>
            <Layout style={{height: '100vh', minWidth: 440}}>
                <Header className="app__header">
                    <div style={{flex: 1}}>
                        <Select
                            style={{ width: '100%', minWidth: 220 }}
                            onChange={ () => {} }
                            placeholder="Select FROM date..."
                            disabled={isFetching}
                        > 
                            { (from || []).map( (item: any) => (
                                <Option
                                    key={`from-option_${item.key}`}
                                    title={item.value}
                                >
                                    {item.value}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{flex: 1, minWidth: 220}}>
                        <Select
                            style={{ width: '100%' }}
                            onChange={ () => {} }
                            placeholder="Select TO date..."
                            disabled={isFetching}
                        > 
                            { (from || []).map( (item: any) => (
                                <Option
                                    key={`from-option_${item.key}`}
                                    title={item.value}
                                >
                                    {item.value}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Header>
                <Content className="app__content">

                    { mode === EMode.temperature && !isFetching ?
                        <div>
                            {mode} data length: {temperature.length}
                            <details>
                                <summary>Temperature</summary>
                                {JSON.stringify(temperature)}
                            </details>
                        </div>
                        :
                        null
                    }

                    { mode === EMode.precipitation && !isFetching ?
                        <div>
                            {mode} data length: {precipitation.length}
                            <details>
                                <summary>Temperature</summary>
                                {JSON.stringify(precipitation)}
                            </details>
                        </div>
                        :
                        null
                    }

                </Content>
                <Footer className="app__footer">
                    <div style={{padding: 20}}>
                        Изменения температуры и уровня осадков за последние годы.
                    </div>
                </Footer>
            </Layout>
        </Layout>
    );
}

export default App;
