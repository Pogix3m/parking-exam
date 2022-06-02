
type TVehicleCtor = {
    id: string;
    size: EVehicleSize;
};

export enum EVehicleSize {
    S = 1,
    M = 2,
    L = 3,
}

export class Vehicle {
    private readonly id: string;
    private readonly size: EVehicleSize;

    public get Id(): string {
        return this.id;
    }

    public get Size(): EVehicleSize {
        return this.size;
    }

    public constructor(params: TVehicleCtor) {
        const { id, size } = params;
        this.id = id;
        this.size = size;

        this.Check();
    }

    private Check(): void {
        switch (this.Size) {
            case EVehicleSize.S:
            case EVehicleSize.M:
            case EVehicleSize.L: {
                // do nothing
                break;
            }

            default: throw new Error("Invalid vehicle size");
        }
    }
}

