import { Slot } from "./slot";
import { Vehicle } from "./vehicle";
import { Rate, TRate } from "./rate";

export type TParkingSlotDetail = {
    slot: Slot;
    vehicle: Vehicle;
    time: number;
};

type TParkingPastEntry = TParkingSlotDetail & { rate: TRate; endTime: number };

export class Parking {
    private readonly availableSlots: Slot[] = [];
    private readonly entryPoints: number;
    private readonly minEntryPoints: number = 3;
    private readonly parkedVehicles: Map<Vehicle["Id"], TParkingSlotDetail> = new Map();
    private readonly pastEntries: Map<Vehicle["Id"], TParkingPastEntry> = new Map();
    private time: number = 0;

    // currently unused
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

            let time: number = this.Time;

            const pastEntry: TParkingPastEntry | undefined = this.pastEntries.get(vehicle.Id);
            if (pastEntry) {
                if (this.Time - pastEntry.endTime <= 1) {
                    // adjust time entry if previously occupied a slot within 1hr
                    time = pastEntry.time;
                }
                else {
                    // if not, no more use for it
                    this.pastEntries.delete(vehicle.Id);
                }
            }

            // add detail to maps
            result = {
                slot,
                vehicle,
                time,
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
            console.log("\nAdditional hours must be greater than 0");
        }
        else {
            this.time += additionalHours;
            console.log(`\nCurrent Time: ${ this.Time }`);
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
            console.log("\nPARK");
            console.log(`Vehicle(${ result.vehicle.Id }) occupies Slot(${ result.slot.Id })`);
        }
        else {
            console.log(`\nNo available parking slot for Vehicle(${ vehicle.Id })`);
        }

        return result;
    }

    /**
     * Free a slot for parked vehicles
     * @param vehicleId
     * @return Charge amount
     */
    public Unpark(vehicleId: string): number {
        console.log("\nUNPARK");
        let charge: number = 0;
        const detail: TParkingSlotDetail | undefined = this.parkedVehicles.get(vehicleId);
        if (detail) {
            // remove parked mapping
            this.parkedVehicles.delete(detail.vehicle.Id);
            this.usedSlots.delete(detail.slot.Id);

            // add to available slots
            this.availableSlots.push(detail.slot);
            console.log(`Slot(${ detail.slot.Id }) is now available`);

            const rate: TRate = Rate.Calculate({
                startTime: detail.time,
                endTime: this.Time,
                slotSize: detail.slot.Size,
            });
            // this assumes that previous rate was already paid
            // therefore, it should not pay the whole new rate
            const previousCharge: number = this.pastEntries.get(detail.vehicle.Id)?.rate.charge ?? 0;
            this.pastEntries.set(
                detail.vehicle.Id,
                {
                    ...detail,
                    rate,
                    endTime: this.Time,
                },
            );

            charge = rate.charge - previousCharge;
            console.log(`Vehicle(${ detail.vehicle.Id }) charge of Php${charge} for total of ${rate.totalHours} hours`);
        }
        else {
            console.log(`Vehicle(${ vehicleId }) not found`);
        }

        return charge;
    }
}
