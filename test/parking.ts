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
            id: "1",
            size: ESlotSize.SP,
            distances: [9, 3, 3],
        });
        const slot2: Slot = new Slot({
            id: "2",
            size: ESlotSize.MP,
            distances: [8, 3, 1],
        });
        const slot3: Slot = new Slot({
            id: "3",
            size: ESlotSize.LP,
            distances: [7, 3, 1],
        });
        const vehicle1: Vehicle = new Vehicle({
            id: "1",
            size: EVehicleSize.M,
        });
        const vehicle2: Vehicle = new Vehicle({
            id: "2",
            size: EVehicleSize.L,
        });
        const vehicle3: Vehicle = new Vehicle({
            id: "3",
            size: EVehicleSize.L,
        });
        const vehicle4: Vehicle = new Vehicle({
            id: "4",
            size: EVehicleSize.S,
        });
        parking.Init([slot3, slot2, slot1]);

        it("Park: Vehicle1", () => {
            // ACT
            const parkedVehicle1: TParkingSlotDetail | undefined = parking.Park(2, vehicle1);

            // ASSERT
            assert.ok(parkedVehicle1, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicle1,
                {
                    slot: slot2,
                    vehicle: vehicle1,
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

        it("Park: Vehicle2", () => {
            // ACT
            const parkedVehicle2: TParkingSlotDetail | undefined = parking.Park(1, vehicle2);

            // ASSERT
            assert.ok(parkedVehicle2, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicle2,
                {
                    slot: slot3,
                    vehicle: vehicle2,
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

        it("Park: Vehicle3", () => {
            // ACT
            const parkedVehicle3: TParkingSlotDetail | undefined = parking.Park(1, vehicle3);

            //ASSERT
            assert.equal(parkedVehicle3, undefined, "No more slot for Large");
        });

        it("Park: Vehicle4", () => {
            // ACT
            const parkedVehicle4: TParkingSlotDetail | undefined = parking.Park(0, vehicle4);

            //ASSERT
            assert.ok(parkedVehicle4, "Should have occupied a slot");
            assert.deepStrictEqual<TParkingSlotDetail>(
                parkedVehicle4,
                {
                    slot: slot1,
                    vehicle: vehicle4,
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

        it("Unpark: Vehicle1", () => {
            // ACT
            const charge: number = parking.Unpark(vehicle1.Id);

            // ASSERT
            assert.equal(charge, 40, "Flat Rate");
            assert.equal(parking.AvailableSlots.length, 1);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot2.Id),
                "Slot should now be available",
            );
        });

        it("Unpark: Vehicle4", () => {
            // ACT
            parking.BypassTime(17);
            const charge: number = parking.Unpark(vehicle4.Id);

            // ASSERT
            assert.equal(charge, 360, "Flat Rate + Exceeding");
            assert.equal(parking.AvailableSlots.length, 2);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot1.Id),
                "Slot should now be available",
            );
        });

        it("Unpark: Vehicle2", () => {
            // ACT
            parking.BypassTime(33);
            const charge: number = parking.Unpark(vehicle2.Id);

            // ASSERT
            assert.equal(charge, 10_400, "2 Days Rate + Exceeding");
            assert.equal(parking.AvailableSlots.length, 3);
            assert.ok(
                parking.AvailableSlots.some((slot: Slot) => slot.Id === slot3.Id),
                "Slot should now be available",
            );
        });
    });
});
