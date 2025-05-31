<img src="https://github.com/owohai/haystack/blob/main/public/haystackbranding.jpg?raw=true" width="1000" title="Why mathematicians can't find the hay in a haystack" alt="Ray Romano saying What do you think?"/>

# haystack

interworld-international package tracking. powered by neondb and a lot of prayers 🙏

# API usage

**`GET`**`/api/pkg/<id>`: gets package details, returned to you in JSON object format; example:

```JSON
{
  "id": "685620752",
  "sender": "owahai",
  "receiver": "yelp street",
  "express": true,
  "signature": false,
  "abandon": false,
  "delivered": false,
  "history": [
    {
      "info": "aaa",
      "location": "aaa",
      "time": "2025-05-27T23:08:40.274865"
    }
  ]
}
```

---


**`POST`**`/api/pkg`: creates package; request format:

```JSON
{
  "sender": "owahai",
  "receiver": "yelp street",
  "express": "<optional>",
  "signature": "<optional>",
  "abandon": "<optional>"
}
```


returns you a trackable package ID e.g `KW685620752`

---


**`PATCH`**`/api/pkg/<id>`: updates package details; request format:


```JSON
{
  "sender": "<optional>",
  "receiver": "<optional>",
  "express": "<optional>",
  "signature": "<optional>",
  "abandon": "<optional>",
  "delivered": "<optional>",
  "handler": "<optional>"
}
```

a simple `200 OK` response will be given if package data was edited successfully


---


**`POST`**`/api/pkg/<id>/history`: adds history entry; request format:

```JSON
{
  "info": "info"
  "location": "location"
}
```


a simple `200 OK` response will be given if history addition was successful. history created previously cannot be modified or edited

## Getting Started
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
