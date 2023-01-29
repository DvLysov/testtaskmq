/** one element in data */
export type ItemData = {
    /** time */
    t: string;
    /** value */
    v: number;
};

export enum EMode {
    temperature = "temperature",
    precipitation = "precipitation",
}
