export const getOptions = (interval: number, start: number) => 
	Array.from({length: interval + 1}).fill(start).map( (item: any, indx) => item + indx);
