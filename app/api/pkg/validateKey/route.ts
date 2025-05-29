import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Validator } from 'jsonschema';

const sql = neon(`${process.env.DATABASE_URL}`);

async function isKeyValid(key: string) {
    const response = await sql`
    SELECT 1
    FROM apikeys
    WHERE key = ${key} AND id IS NOT NULL
    LIMIT 1
  `;

    return response.length > 0;
}

export async function POST(req: NextRequest) {
    let body = await req.json();

    if (!body) return NextResponse.json({ err: "i'm calling the cops on you " })

    let checkValidity = await isKeyValid(body.key);
    if (checkValidity === true) {
        return new Response('', { status: 200 })
    } else {
        return new Response('', { status: 401 })
    }
}