import { Parking } from "./parking";
import { ESlotSize, Slot } from "./slot";
import { EVehicleSize, Vehicle } from "./vehicle";

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

// park
parking.Park(2, vehicleM);
parking.Park(1, vehicleL);
parking.Park(1, vehicleInv);
parking.Park(0, vehicleS);

// unpark: vehicleM
parking.BypassTime(2);
parking.Unpark("404");
parking.Unpark(vehicleM.Id);

// unpark: vehicleS
parking.BypassTime(17);
parking.Unpark(vehicleS.Id);

// unpark: vehicleL
parking.BypassTime(33);
parking.Unpark(vehicleL.Id);

// continuous rate: vehicleL
parking.Park(1, vehicleL);
parking.BypassTime(24);
parking.Unpark(vehicleL.Id);
