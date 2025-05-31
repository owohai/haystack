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
    },
    required: [
        "apiKey",
        "sender",
        "receiver",
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

/* API key validation + operator info (to register under operator name) */
async function combinedKeyInfo(key: string) {
    const result = await sql`
    SELECT operator, country_code
    FROM apikeys
    WHERE key = ${key} AND id IS NOT NULL
    LIMIT 1
  `;

    if (result.length === 0) return { isValid: false, operatorName: null, countryCode: null };
    return { isValid: true, operatorName: result[0].operator, countryCode: result[0].country_code };
}

async function createData(data: {
    sender: string;
    receiver: string;
    country_code: string;
    handler: string;
    express?: boolean;
    signature?: boolean;
    abandon?: boolean;
}) {
    const {
        sender,
        receiver,
        handler,
        express = false,
        signature = false,
        abandon = false
    } = data;

    const country_code = data.country_code.toUpperCase(); // redundancy check

    const response = await sql`
    INSERT INTO tracking (
      sender,
      receiver,
      express,
      signature,
      abandon,
      country_code,
      handler
    ) VALUES (
      ${sender},
      ${receiver},
      ${express},
      ${signature},
      ${abandon},
      ${country_code},
      ${handler}
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
    var keyValidation = await combinedKeyInfo(body.apiKey)

    if (keyValidation.isValid === false) return new Response('', { status: 401 })

    if (check.valid) {
        let compliation = Object.assign(body, { "handler": `${keyValidation.operatorName}`, "country_code": `${keyValidation.countryCode}` })

        let created = await createData(compliation)
        return NextResponse.json({ id: body.country_code + created });
    } else {
        return NextResponse.json({ err: "i'm calling the cops on you" }, { status: 500 });
    }
}
