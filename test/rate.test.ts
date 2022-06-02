import * as assert from "assert";
import { ESlotSize } from "../src/slot";
import { Rate } from "../src/rate";

describe("Rate Class", () => {
    it("Calculate", () => {
        // less than 24hrs
        assert.deepStrictEqual(
            Rate.Calculate({
                startTime: 0,
                endTime: 19,
                slotSize: ESlotSize.SP,
            }),
            {
                totalHours: 19,
                days: 0,
                exceedingHours: 16,
                charge: 360,
            }
        );

        // more than 24hrs
        assert.deepStrictEqual(
            Rate.Calculate({
                startTime: 0,
                endTime: 52,
                slotSize: ESlotSize.LP,
            }),
            {
                totalHours: 52,
                days: 2,
                exceedingHours: 4,
                charge: 10_400,
            }
        );

        // less than 3hrs
        assert.deepStrictEqual(
            Rate.Calculate({
                startTime: 0,
                endTime: 2,
                slotSize: ESlotSize.MP,
            }),
            {
                totalHours: 2,
                days: 0,
                exceedingHours: 0,
                charge: 40,
            }
        );
    });
});
