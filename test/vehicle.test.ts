import * as assert from "assert";
import { EVehicleSize, Vehicle } from "../src/vehicle";

describe("Vehicle Class", () => {
    it("constructor", () => {
        assert.ok(new Vehicle({
            id: "1",
            size: EVehicleSize.L,
        }));

        assert.throws(
            () => {
                new Vehicle({
                    id: "1",
                    size: 0 as EVehicleSize,
                })
            },
            "Undefined size must be invalid"
        );
    });
});
