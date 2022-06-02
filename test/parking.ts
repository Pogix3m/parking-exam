import * as assert from "assert";
import { Parking, TParkingSlotDetail } from "../src/parking";
import { ESlotSize, Slot } from "../src/slot";
import { EVehicleSize, Vehicle } from "../src/vehicle";

describe("Parking Class", () => {
    it("constructor", () => {
        assert.ok(new Parking(3));

        assert.throws(() => {
            new Parking(2),
            "Less than 3 must be invalid"
        });
    });

    it("Invalid Init Slots: More distance length", () => {
        const parking: Parking = new Parking(3);
        const slot: Slot = new Slot({
            id: "1",
            size: ESlotSize.MP,
            distances: [1, 2, 3, 4],
        });

        assert.throws(() => parking.Init([ slot ]));
    });

    it("Invalid Init Slots: Less distance length", () => {
        const parking: Parking = new Parking(3);
        const slot: Slot = new Slot({
            id: "1",
            size: ESlotSize.MP,
            distances: [1, 2],
        });

        assert.throws(() => parking.Init([ slot ]));
    });

    it("Init Slots", () => {
        const parking: Parking = new Parking(3);
        const slot1: Slot = new Slot({
            id: "1",
            size: ESlotSize.SP,
            distances: [1, 2, 3],
        });
        const slot2: Slot = new Slot({
            id: "2",
            size: ESlotSize.MP,
            distances: [4, 5, 6],
        });
        const slot3: Slot = new Slot({
            id: "3",
            size: ESlotSize.LP,
            distances: [7, 8, 9],
        });

        assert.doesNotThrow(() => parking.Init([ slot1, slot2, slot3 ]));
        assert.equal(parking.AvailableSlots.find((slot: Slot) => slot.Id === slot1.Id), slot1);
        assert.equal(parking.AvailableSlots.find((slot: Slot) => slot.Id === slot2.Id), slot2);
        assert.equal(parking.AvailableSlots.find((slot: Slot) => slot.Id === slot3.Id), slot3);
    });

    describe("Functions", () => {
        // ARRANGE
        const parking: Parking = new Parking(3);
        const slot1: Slot = new Slot({
            id: "SP",
            size: ESlotSize.SP,
            distances: [9, 3, 3],
        });
        const slot2: Slot = new Slot({
            id: "MP",
            size: ESlotSize.MP,
            distances: [8, 3, 1],
        });
        const slot3: Slot = new Slot({
            id: "LP",
            size: ESlotSize.LP,
            distances: [7, 3, 1],
        });
        const vehicleM: Vehicle = new Vehicle({
            id: "M",
            size: EVehicleSize.M,
        });
        const vehicleL: Vehicle = new Vehicle({
            id: "L",
            size: EVehicleSize.L,
        });
        const vehicleInv: Vehicle = new Vehicle({
            id: "Inv",
            size: EVehicleSize.L,
        });
        const vehicleS: Vehicle = new Vehicle({
            id: "S",
            size: EVehicleSize.S,
        });
        parking.Init([slot3, slot2, slot1]);

        it("Park: VehicleM", () => {
            // ACT
            const parkedVehicleM: TParkingSlotDetail | undefined = parking.Park(2, vehicleM);

            // ASSERT
            assert.ok(parkedVehicleM, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicleM,
                {
                    slot: slot2,
                    vehicle: vehicleM,
                    time: 0,
                },
                "Even though same distance with slot 3, smaller slot size will be the priority",
            );
            assert.equal(parking.AvailableSlots.length, 2);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot1.Id),
                "Slot 1 should still be available",
            );
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot3.Id),
                "Slot 3 should still be available",
            );
        });

        it("Park: VehicleL", () => {
            // ACT
            const parkedVehicleL: TParkingSlotDetail | undefined = parking.Park(1, vehicleL);

            // ASSERT
            assert.ok(parkedVehicleL, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicleL,
                {
                    slot: slot3,
                    vehicle: vehicleL,
                    time: 0,
                },
                "Even though same distance with slot 1, will occupy base on size",
            );
            assert.equal(parking.AvailableSlots.length, 1);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot1.Id),
                "Slot 1 should still be available",
            );
        });

        it("Park: VehicleInv", () => {
            // ACT
            const parkedVehicleInv: TParkingSlotDetail | undefined = parking.Park(1, vehicleInv);

            //ASSERT
            assert.equal(parkedVehicleInv, undefined, "No more slot for Large");
        });

        it("Park: VehicleS", () => {
            // ACT
            const parkedVehicleS: TParkingSlotDetail | undefined = parking.Park(0, vehicleS);

            //ASSERT
            assert.ok(parkedVehicleS, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicleS,
                {
                    slot: slot1,
                    vehicle: vehicleS,
                    time: 0,
                },
                "Occupy the remaining slot",
            );
            assert.equal(parking.AvailableSlots.length, 0);
        });

        it("Bypass Time", () => {
            // ACT
            parking.BypassTime(1);
            parking.BypassTime(1);

            // ASSERT
            assert.equal(parking.Time , 2);
        });

        it("Unpark: Not existing vehicle", () => {
            // ACT
            const charge: number = parking.Unpark("404");

            // ASSERT
            assert.equal(charge, 0, "No charge");
            assert.equal(parking.AvailableSlots.length, 0);
        });

        it("Unpark: VehicleM", () => {
            // ACT
            const charge: number = parking.Unpark(vehicleM.Id);

            // ASSERT
            assert.equal(charge, 40, "Flat Rate");
            assert.equal(parking.AvailableSlots.length, 1);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot2.Id),
                "Slot should now be available",
            );
        });

        it("Unpark: VehicleS", () => {
            // ACT
            parking.BypassTime(17);
            const charge: number = parking.Unpark(vehicleS.Id);

            // ASSERT
            assert.equal(charge, 360, "Flat Rate + Exceeding");
            assert.equal(parking.AvailableSlots.length, 2);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot1.Id),
                "Slot should now be available",
            );
        });

        it("Unpark: VehicleL", () => {
            // ACT
            parking.BypassTime(33);
            const charge: number = parking.Unpark(vehicleL.Id);

            // ASSERT
            assert.equal(charge, 10_400, "2 Days Rate + Exceeding");
            assert.equal(parking.AvailableSlots.length, 3);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot3.Id),
                "Slot should now be available",
            );
        });

        it("Park/Unpark: Within an hour", () => {
            // ACT
            parking.Park(1, vehicleL);
            parking.BypassTime(24);
            const charge: number = parking.Unpark(vehicleL.Id);

            // ASSERT
            assert.equal(charge, 5_000, "Continuous Rate: additional 1 day");
        });
    });
});
