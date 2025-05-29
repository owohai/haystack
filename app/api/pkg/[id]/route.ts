import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Validator } from 'jsonschema';

const sql = neon(`${process.env.DATABASE_URL}`);

let v = new Validator();
let pkgSchema = {
  id: "/PackageId",
  type: "object",
  properties: {
    apiKey: { type: "string" },
    id: { type: "string" },
    sender: { type: "string" },
    receiver: { type: "string" },
    express: { type: "boolean" },
    signature: { type: "boolean" },
    abandon: { type: "boolean" },
    delivered: { type: "boolean" },
    country_code: { type: "string", maxLength: 2 }
  },
  required: [
    "apiKey",
  ],
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

/* Getting data from database */
async function getData(id: string) {
  const response = await sql`
    SELECT 
      t.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'info', h.info,
            'location', h.location,
            'time', h.time
          )
        ) FILTER (WHERE h.id IS NOT NULL), '[]'
      ) AS history
    FROM tracking t
    LEFT JOIN history h ON h.package_id = t.id
    WHERE t.id = ${id}
    GROUP BY t.id
  `;

  return response[0];
}

/* Update data according to partial input to database */
async function updateData(
  id: string,
  updates: Partial<{
    sender: string;
    receiver: string;
    express: boolean;
    signature: boolean;
    abandon: boolean;
    delivered: boolean;
    country_code: string;
  }>
) {
  const updatableFields = [
    "sender", "receiver", "express", "signature",
    "abandon", "delivered", "country_code"
  ];

  // Filter out invalid fields and ignore empty strings for sender/receiver
  const fieldsToUpdate = Object.entries(updates).filter(([key, value]) =>
    updatableFields.includes(key) &&
    !(["sender", "receiver", "country_code"].includes(key) && value === "")
  );

  if (fieldsToUpdate.length === 0) {
    throw new Error("nothing to update");
  }

  const setClauses = fieldsToUpdate.map(([key], idx) => `${key} = $${idx + 2}`);
  const values = fieldsToUpdate.map(([, value]) => value);

  const query = `
    UPDATE tracking
    SET ${setClauses.join(", ")}
    WHERE id = $1
    RETURNING *;
  `;

  const response = await sql(query, [id, ...values]);
  return response[0];
}

/***********************************/
/*      Get package data (GET)     */
/***********************************/

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!id) return new Response('', { status: 400 }) // no id in url param

  if (isValid(id)) {
    let data = await getData(id.slice(2)); // get data (make sure ID is SLICED!!!!)
    if (!data) return NextResponse.json({ err: 'no data in db' }, { status: 404 }) // id not found in db/no data

    return NextResponse.json(data) // id found, sending data
  } else {
    return NextResponse.json({ err: "id not valid; see schema" }, { status: 400 }) // id is not valid according to schema
  }
}

/***********************************/
/*  Update package detials (PATCH) */
/***********************************/

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = await params;

  if (!id) return new Response('', { status: 400 })
  
  try {
    var check = v.validate(body, pkgSchema)
    var apiKeyValidation = await isKeyValid(body.apiKey);

    if (apiKeyValidation === false) return new Response('', { status: 401 })
      
    if (check.valid) {
      if (isValid(id)) {
        let updated = await updateData(id.slice(2), body);

        if (!updated) return NextResponse.json({ err: "id doesn't exist" }, { status: 500 });

        return new Response('', { status: 200 })
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