import { ESlotSize } from "./slot";

type TRateExceedingHourlyRate = {
    [index: string]: number;
};
type TRateFlatRate = {
    amount: number;
    hour: number;
    perDay: number;
};

export type TRateCompute = {
    startTime: number;
    endTime: number;
    slotSize: ESlotSize;
};

export type TRate = {
    /** total number of hours parked */
    totalHours: number;
    /** total number of hours converted to days */
    days: number;
    /** exceeding hours from flat rate or converted days */
    exceedingHours: number;
    /** amount needed to pay */
    charge: number;
};

export class Rate {
    private static instance: Rate;
    private readonly exceedingHourlyRate: TRateExceedingHourlyRate = {
        [ESlotSize.SP.toString()]: 20,
        [ESlotSize.MP.toString()]: 60,
        [ESlotSize.LP.toString()]: 100,
    };
    private readonly flatRate: TRateFlatRate = {
        amount: 40,
        hour: 3,
        perDay: 5000,
    };
    private readonly hrPrDay: number = 24;

    private constructor() {}

    private GetRate(params: TRateCompute): TRate {
        const { startTime, endTime, slotSize } = params;
        const result: TRate = {
            totalHours: 0,
            days: 0,
            exceedingHours: 0,
            charge: 0,
        };
        result.totalHours = Math.ceil(endTime - startTime); // round up
        if (result.totalHours <= this.flatRate.hour) {
            result.charge = this.flatRate.amount;
            result.exceedingHours = 0;
        }
        else {
            // more than a day
            if (result.totalHours >= this.hrPrDay) {
                result.days = Math.floor(result.totalHours / this.hrPrDay);
                result.exceedingHours = result.totalHours % this.hrPrDay;
            }
            else {
                // flat rate
                result.charge = this.flatRate.amount;
                result.exceedingHours = result.totalHours - this.flatRate.hour;
            }

            result.charge += (result.days * this.flatRate.perDay)
                + (result.exceedingHours * this.exceedingHourlyRate[slotSize.toString()]);
        }

        return result;
    }

    public static Calculate(params: TRateCompute): TRate {
        let rate: Rate;
        if (Rate.instance) { rate = Rate.instance; }
        else { rate = new Rate(); }

        return rate.GetRate(params);
    }
}
