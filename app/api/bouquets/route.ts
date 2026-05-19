import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { bouquets } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { mode, flowers, letter, greenery, flowerOrder, timestamp, canvasFlowers, canvasBg } = body;
        const short_id = nanoid(8)

        const [row] = await db
        .insert(bouquets)
        .values({
            short_id,
            mode,
            flowers,
            letter,
            greenery,
            flowerOrder,
            canvasFlowers: canvasFlowers ?? null,
            canvasBg: canvasBg ?? null,
            timestamp
        })
        .returning()

        return NextResponse.json({ id: row.id, short_id: row.short_id})
    } catch (err) {
        console.log("Error creating bouquet:", err)
        return NextResponse.json({error: "Failed to create bouquet"}, {status: 500})
    }
}