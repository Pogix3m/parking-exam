import { Slot } from "./slot";
import { Vehicle } from "./vehicle";

type TParkingSlotDetail = {
    slot: Slot;
    vehicle: Vehicle;
    // time: number;
};

export class Parking {
    private readonly availableSlots: Slot[] = [];
    private readonly entryPoints: number;
    private readonly parkedVehicles: Map<Vehicle["Id"], TParkingSlotDetail> = new Map();
    private time: number = 0;
    private readonly usedSlots: Map<Slot["Id"], TParkingSlotDetail> = new Map();

    public get Time(): number {
        return this.time;
    }

    public constructor(entryPoints: number) {
        if (entryPoints < 3) {
            throw new Error("Entry points must not be less than 3");
        }

        this.entryPoints = entryPoints;
    }

    private GetAvailableSlot(entryPoint: number, vehicle: Vehicle): Slot | undefined {
        const [ slot ] = this.availableSlots
            // filter by size first
            .filter((slot: Slot) => vehicle.Size <= slot.Size)

            // sort by distance
            // if same distance then by lot size(smaller size is priority).
            .sort((a: Slot, b: Slot) => {
                const result: number = a.Distances[entryPoint] - b.Distances[entryPoint];
                if (result === 0) {
                    return a.Size - b.Distances[entryPoint];
                }

                return result;
            });

        if (slot) {
            // remove from the available slot
            this.availableSlots.splice(
                this.availableSlots.findIndex((availableSlot: Slot) => slot.Id === availableSlot.Id),
                1,
            );

            // add detail to maps
            const detail: TParkingSlotDetail = {
                slot,
                vehicle,
                // time: this.Time,
            };
            this.parkedVehicles.set(vehicle.Id, detail);
            this.usedSlots.set(slot.Id, detail);
        }

        return slot;
    }

    /**
     * Initialized parking slots
     * @param slots Available slot info
     */
    public Init(slots: Slot[]): void {
        slots.forEach((slot: Slot) => {
            // check distance per entry points
            if (slot.Distances.length !== this.entryPoints) {
                throw new Error("Number of distances must be equal to number of entry points");
            }

            this.availableSlots.push(slot);
        });
    }

    /**
     * Parks a vehicle making a slot unavailable
     * @param entryPoint Value is from 0 to EntryPoints - 1
     * @param vehicle Vehicle info to be parked
     * @return Parking slot occupied
     */
    public Park(entryPoint: number, vehicle: Vehicle): Slot | undefined {
        if (entryPoint < 0 || entryPoint >= this.entryPoints) {
            throw new Error("Invalid entry point");
        }

        const slot: Slot | undefined = this.GetAvailableSlot(entryPoint, vehicle);
        if (slot) {
            console.log(`Vehicle parking slot: ${ slot.Id }`);
        }
        else {
            console.log("No available parking slot");
        }

        return slot;
    }

    /**
     * Free a slot for parked vehicles
     * @param vehicleId
     * @return Vehicle and Parking slot details
     */
    public Unpark(vehicleId: string): TParkingSlotDetail | undefined {
        const detail: TParkingSlotDetail | undefined = this.parkedVehicles.get(vehicleId);
        if (detail) {
            // remove parked mapping
            this.parkedVehicles.delete(detail.vehicle.Id);
            this.usedSlots.delete(detail.slot.Id);

            // add to available slots
            this.availableSlots.push(detail.slot);
        }
        else {
            console.log("Vehicle not found");
        }


        return detail;
    }
}
