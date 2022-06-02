
type TSlotCtor = {
    /** index is mapped to entryPoints. so items must be equal to the number of entry points */
    distances: number[];
    id: string;
    size: ESlotSize;
};

export enum ESlotSize {
    SP = 1,
    MP = 2,
    LP = 3,
}

export class Slot {
    private readonly distances: number[];
    private readonly id: string;
    private readonly size: ESlotSize;

    public get Distances(): number[] {
        return this.distances;
    }

    public get Id(): string {
        return this.id;
    }

    public get Size(): ESlotSize {
        return this.size;
    }

    public constructor(params: TSlotCtor) {
        const { id, size, distances } = params;
        this.id = id;
        this.size = size;
        this.distances = distances;

        this.Check();
    }

    private Check(): void {
        switch (this.Size) {
            case ESlotSize.SP:
            case ESlotSize.MP:
            case ESlotSize.LP: {
                // do nothing
                break;
            }

            default: throw new Error("Invalid slot size");
        }

        if (this.Distances.some((distance: number) => distance <= 0)) {
            throw new Error("Distance must be greater than 0");
        }
    }
}
