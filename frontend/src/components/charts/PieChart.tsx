"use client"
import React from "react";

type PieSlice = {
    label: string;
    value: number;
    color: string;
};

type PieChartProps = {
    data: PieSlice[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
};

export default function PieChart({ data, size = 220, thickness = 28, centerLabel }: PieChartProps) {
    const total = data.reduce((sum, d) => sum + (isFinite(d.value) ? d.value : 0), 0);
    const radius = size / 2;
    const innerRadius = radius - thickness;
    let cumulative = 0;

    const toPolar = (value: number) => {
        const angle = (value / total) * Math.PI * 2 - Math.PI / 2;
        return {
            x: radius + Math.cos(angle) * radius,
            y: radius + Math.sin(angle) * radius
        };
    };

    const toInnerPolar = (value: number) => {
        const angle = (value / total) * Math.PI * 2 - Math.PI / 2;
        return {
            x: radius + Math.cos(angle) * innerRadius,
            y: radius + Math.sin(angle) * innerRadius
        };
    };

    const paths = data.map((slice, index) => {
        const startValue = cumulative;
        const endValue = cumulative + slice.value;
        cumulative = endValue;
        const largeArc = slice.value / total > 0.5 ? 1 : 0;

        const startOuter = toPolar(startValue);
        const endOuter = toPolar(endValue);
        const endInner = toInnerPolar(endValue);
        const startInner = toInnerPolar(startValue);

        const d = [
            `M ${startOuter.x} ${startOuter.y}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
            `L ${endInner.x} ${endInner.y}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
            "Z"
        ].join(" ");

        return (
            <path
                key={index}
                d={d}
                fill={slice.color}
                className="transition-opacity hover:opacity-90"
            />
        );
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g>{paths}</g>
            </svg>
            {centerLabel && (
                <div
                    className="absolute inset-0 flex items-center justify-center text-center"
                    style={{ pointerEvents: "none" }}
                >
                    <div>
                        <div className="text-white text-xl font-semibold">{centerLabel}</div>
                        <div className="text-gray-400 text-xs">Total</div>
                    </div>
                </div>
            )}
        </div>
    );
}


