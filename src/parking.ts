import { Slot } from "./slot";
import { Vehicle } from "./vehicle";

export type TParkingSlotDetail = {
    slot: Slot;
    vehicle: Vehicle;
    // time: number;
};

export class Parking {
    private readonly availableSlots: Slot[] = [];
    private readonly entryPoints: number;
    private readonly minEntryPoints: number = 3;
    private readonly parkedVehicles: Map<Vehicle["Id"], TParkingSlotDetail> = new Map();
    private time: number = 0;
    private readonly usedSlots: Map<Slot["Id"], TParkingSlotDetail> = new Map();

    public get AvailableSlots(): Slot[] {
        return this.availableSlots;
    }

    public get Time(): number {
        return this.time;
    }

    public constructor(entryPoints: number) {
        if (entryPoints < this.minEntryPoints) {
            throw new Error("Entry points must not be less than 3");
        }

        this.entryPoints = entryPoints;
    }

    private OccupyAvailableSlot(entryPoint: number, vehicle: Vehicle): TParkingSlotDetail | undefined {
        let result: TParkingSlotDetail | undefined = undefined;
        const [ slot ] = this.availableSlots
            // filter by size first
            .filter((slot: Slot) => vehicle.Size <= slot.Size)

            // sort by distance
            // if same distance then by lot size(smaller size is priority).
            .sort((a: Slot, b: Slot) => {
                const result: number = a.Distances[entryPoint] - b.Distances[entryPoint];
                if (result === 0) {
                    return a.Size - b.Size;
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
            result = {
                slot,
                vehicle,
                // time: this.Time,
            };
            this.parkedVehicles.set(vehicle.Id, result);
            this.usedSlots.set(slot.Id, result);
        }

        return result;
    }

    /**
     * Bypass time for parked cars
     * @param additionalHours The amount of time to bypass(in hours)
     * @return Total time
     */
    public BypassTime(additionalHours: number): number {
        if (additionalHours <= 0) {
            console.log("Additional hours must be greater than 0");
        }
        else {
            this.time += additionalHours;
        }

        return this.Time;
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
     * @return Occupied slot details
     */
    public Park(entryPoint: number, vehicle: Vehicle): TParkingSlotDetail | undefined {
        let result: TParkingSlotDetail | undefined = undefined;

        if (entryPoint < 0 || entryPoint >= this.entryPoints) {
            throw new Error("Invalid entry point");
        }
        if (this.parkedVehicles.has(vehicle.Id)) {
            console.log("A vehicle with this Id is already parked");

            return result;
        }

        result = this.OccupyAvailableSlot(entryPoint, vehicle);
        if (result) {
            console.log(`Vehicle(${ result.vehicle.Id }) occupies slot: ${ result.slot.Id }`);
        }
        else {
            console.log("No available parking slot");
        }

        return result;
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
