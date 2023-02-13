import moment from 'moment';

import type { ItemData } from '../types';
import { EMode } from '../types';

import Canvas from './Canvas';

/**
 * Value getter of temperature or precipitation from data obj
 * @param obj 
 * @returns temperature or precipitation
 */
const valueGetter = (obj: ItemData) =>
	obj ? obj.v : 0;


/**
 * Calc average value of array items
 * @param arr ItemData[]
 * @param fromIndx number
 * @param toIndx number
 * @returns average value
 */
const getAverageValue = (arr: ItemData[], fromIndx: number, toIndx: number) => {
	let s = 0;
	for (let k = fromIndx; k < toIndx; k++) {
		const v = valueGetter(arr[k]);
		s += v;
	}

	return ( s / (toIndx - fromIndx + 1) );
}

const getY = (height: number, value: number, maxH: number) => 
	( height / 2 ) - ( (height * value ) / maxH);

const draw = (inputData: ItemData[], fromYear: number, toYear: number,  ctx: any, frameCount: any)=> {

	let data: number[] = [];

	// We set canvas width, height
	ctx.canvas.style.width ='100%';
	ctx.canvas.style.height ='100%';

	ctx.canvas.width  = ctx.canvas.offsetWidth;
	ctx.canvas.height = ctx.canvas.offsetHeight;

	if ( Math.floor(inputData.length / ctx.canvas.width) > 1 ) {
		let averagingInterval: number = Math.ceil(inputData.length / ctx.canvas.width);
		for (let k=0; k < Math.floor(inputData.length/averagingInterval);k++) {
			const averageV = getAverageValue(inputData, averagingInterval*k, (averagingInterval*(k+1)) );
			data.push(averageV);
		}
	} else {
		for (let k = 0; k < inputData.length; k++) {
			data.push( valueGetter(inputData[k]) );
		}
	}

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.moveTo(0, 0);

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#00ff00";

	const maxH = 100;
	const halfMaxH = maxH / 2;

	let x0 = 0;
	let y0 = getY(ctx.canvas.height, data[0], maxH);

	ctx.moveTo(x0, y0);

	const l = data.length - 1;

	let paddingRight = 0;

	for (let i = 1; i < l; i++) {

		const xi = i * ( (ctx.canvas.width - paddingRight) / (l-1) );
		const yi = getY(ctx.canvas.height, data[i], maxH);

		ctx.lineTo(xi, yi);
	}

	ctx.stroke();

	ctx.fillStyle = "rgba(0, 0, 0, 0)";

	ctx.lineTo( ctx.canvas.width - (paddingRight + 1), ctx.canvas.height );
	ctx.lineTo(1, ctx.canvas.height);
	ctx.closePath();
	ctx.fill();

	ctx.strokeRect(0, 0, ctx.canvas.width - paddingRight, ctx.canvas.height);

	ctx.beginPath();
	
	ctx.font = `14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;
	ctx.strokeStyle = "gray";
	
	ctx.lineWidth = 0.2;

	let stepY = 10;

	let horizontalLine = ctx.canvas.height / stepY;

	for (let index = 1; index < stepY; index++) {
		ctx.moveTo(0, horizontalLine * index);
		ctx.lineTo(ctx.canvas.width - paddingRight, (horizontalLine * index) + 0.2);
		ctx.strokeText( halfMaxH - (index * stepY), 0, (horizontalLine * index) - 0.8 )
		ctx.moveTo(0, 0);
	}

	ctx.strokeText("-" + halfMaxH, 0, ctx.canvas.height - 2);
	ctx.strokeText("" + halfMaxH, 0, 12);

	const xLabelsCount = ( toYear - fromYear ) + 1;
	const showMonths = xLabelsCount === 1 ? true : false;
	const stepX = showMonths ? 12 : xLabelsCount;
	const verticalLine = ctx.canvas.width / stepX;
	const showXLabels = xLabelsCount < 12 ? true : false;

	for (let index = 1; index <= stepX; index++) {
		const vLi = (verticalLine * index);
		ctx.moveTo( vLi, ctx.canvas.height);
		ctx.lineTo( vLi, 0 );
		
		if (showXLabels) {
			ctx.strokeText( showMonths ? index : fromYear + (index-1), vLi - (verticalLine/2), ctx.canvas.height - 10 );
		}
		
		ctx.moveTo(0, 0);
	}


	ctx.stroke();
}

function Chart(props: { 
	mode: EMode, 
	fromYear: number | null, 
	toYear: number | null, 
	data: ItemData[]
}) {

	let filteredItems: ItemData[] = [];

	if (props.fromYear && props.toYear) {
		// Pick the data items from current Interval(fromYear, toYear)
		const f = moment(props.fromYear - 1, 'YYYY').endOf('year').format('YYYY-MM-DD');
		const t = moment(props.toYear + 1, 'YYYY').startOf('year').format('YYYY-MM-DD');
		filteredItems = (props.data || []).filter( (item: ItemData) => ( item.t > f && item.t < t ? true : false ) );
	}

	return (
		<div className="chart-wrapper">
			<Canvas 
				draw={draw.bind(null, 
					filteredItems, 
					props.fromYear ? props.fromYear : 0, 
					props.toYear ? props.toYear : 0
				)}
			/>
		</div>
	);
}

export default Chart;
