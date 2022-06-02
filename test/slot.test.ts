import * as assert from "assert";
import { ESlotSize, Slot } from "../src/slot";

describe("Slot Class", () => {
    it("constructor", () => {
        assert.ok(new Slot({
            id: "1",
            size: ESlotSize.LP,
            distances: [1,2,3],
        }));

        assert.throws(
            () => {
                new Slot({
                    id: "1",
                    size: ESlotSize.SP,
                    distances: [1,0],
                })
            },
            "0 distance must be invalid"
        );

        assert.throws(
            () => {
                new Slot({
                    id: "1",
                    size: ESlotSize.LP,
                    distances: [1,-10],
                })
            },
            "Negative distance must be invalid"
        );
    });
});
