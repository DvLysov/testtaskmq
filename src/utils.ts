export const getOptions = (interval: number, start: number) => 
    Array.from({length: interval}).fill(start).map( (item: any, indx) => item + indx);
