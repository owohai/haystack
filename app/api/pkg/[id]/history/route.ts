import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Validator } from 'jsonschema';

const sql = neon(`${process.env.DATABASE_URL}`);

let v = new Validator();
let historySchema = {
    type: "object",
    properties: {
        apiKey: { type: "string" },
        info: { type: "string" },
        location: { type: "string" },
    },
    required: ["apiKey", "info", "location"],
    additionalProperties: false
};

/* Validate ID */
function isValid(id: string) {
    const pattern = /^[A-Z]{2}\d{9}$/;
    return pattern.test(id);
}

/* API key validation */
async function isKeyValid(key: string) {
    const response = await sql`
    SELECT 1
    FROM apikeys
    WHERE key = ${key} AND id IS NOT NULL
    LIMIT 1
  `;

    return response.length > 0; // true/false
}

async function canIUpdate(id: string) {
    const response = await sql`
    SELECT 1
    FROM tracking
    WHERE id = ${id} AND delivered IS NOT FALSE
    LIMIT 1
  `;

    return response.length > 0;
}

async function addHistory(data: {
    id: string;
    info: string;
    location: string;
}) {
    const {
        id,
        info,
        location
    } = data;

    const response = await sql`
    INSERT INTO history (
      package_id,
      info,
      location
    ) VALUES (
      ${id},
      ${info},
      ${location}
    )
  `;

    return response[0];
}



export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    const body = await req.json();

    if (!id) return new Response('', { status: 400 }) // no id in url param

    try {
        var check = v.validate(body, historySchema)
        var apiKeyValidation = await isKeyValid(body.apiKey);
        var updateOrNot = await canIUpdate(id.slice(2))

        if (apiKeyValidation === false) return new Response('', { status: 401 })

        if (check.valid) {
            if (isValid(id)) {
                if (updateOrNot === true) return NextResponse.json({ err: "cannot update package history because it has been delivered already" }, { status: 400 })

                let compliation = Object.assign(body, { "id": `${id.slice(2)}` }) // horrible cobe yes cobe
                addHistory(body)
                return new Response('', { status: 200 })
                //addHistory
            } else {
                return NextResponse.json({ err: "id not valid; see schema" }, { status: 400 }) // id is not valid according to schema
            }
        } else {
            return NextResponse.json({ err: "body not valid; see schema" }, { status: 400 }) // id is not valid according to schema
        }
    } catch (e) {
        console.log(e)
        return NextResponse.json({ err: "i called the cops on you", e: e }, { status: 500 });
    }
}