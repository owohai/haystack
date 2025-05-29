import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Validator } from 'jsonschema';

const sql = neon(`${process.env.DATABASE_URL}`);

let v = new Validator();
let pkgSchema = {
    type: "object",
    properties: {
        apiKey: { type: "string" },
        sender: { type: "string" },
        receiver: { type: "string" },
        express: { type: "boolean" },
        signature: { type: "boolean" },
        abandon: { type: "boolean" },
        country_code: { type: "string", minLength: 2, maxLength: 2 }
    },
    required: [
        "apiKey",
        "sender",
        "receiver",
        "country_code"
    ],
    additionalProperties: false
};

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

async function createData(data: {
    sender: string;
    receiver: string;
    country_code: string;
    express?: boolean;
    signature?: boolean;
    abandon?: boolean;
}) {
    const {
        sender,
        receiver,
        express = false,
        signature = false,
        abandon = false
    } = data;

    const country_code = data.country_code.toUpperCase();

    const response = await sql`
    INSERT INTO tracking (
      sender,
      receiver,
      express,
      signature,
      abandon,
      country_code
    ) VALUES (
      ${sender},
      ${receiver},
      ${express},
      ${signature},
      ${abandon},
      ${country_code}
    )
      RETURNING id;
  `;

    return response[0]?.id;
}

/***********************************/
/*  Create package          (POST) */
/***********************************/

export async function POST(req: NextRequest) {
    const body = await req.json();
    var check = v.validate(body, pkgSchema)
    var apiKeyValidation = await isKeyValid(body.apiKey);

    if (apiKeyValidation === false) return new Response('', { status: 401 })

    if (check.valid) {
        let created = await createData(body)
        return NextResponse.json({ id: body.country_code + created });
    } else {
        return NextResponse.json({ err: "i'm calling the cops on you" }, { status: 500 });
    }
}
