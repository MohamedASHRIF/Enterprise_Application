export type Service = {
    id: number;
    name: string;
    description: string;
    estimateMins: number;
    cost: number;
    active: boolean;
    category?: string;
};

export const defaultServices: Service[] = [
    { id: 1, name: "Oil Change", description: "Standard oil and filter change", estimateMins: 30, cost: 29.99, active: true, category: "minor category" },
    { id: 2, name: "Tire Rotation", description: "Rotate all four tires", estimateMins: 15, cost: 19.99, active: true, category: "immediate category" },
    { id: 3, name: "Brake Inspection", description: "Complete brake system check", estimateMins: 45, cost: 49.99, active: true, category: "minor category" },
    { id: 4, name: "Battery Replacement", description: "Test and replace battery if needed", estimateMins: 30, cost: 149.99, active: true, category: "major category" },
    { id: 5, name: "Full Service", description: "Complete vehicle inspection and tune-up", estimateMins: 120, cost: 199.99, active: true, category: "major category" },
    { id: 6, name: "AC Service", description: "AC system cleaning and recharge", estimateMins: 60, cost: 79.99, active: true, category: "minor category" },
];

export function formatDuration(mins: number): string {
    if (mins % 60 === 0) {
        const hours = mins / 60;
        return `${hours} hour${hours === 1 ? "" : "s"}`;
    }
    return `${mins} min`;
}

