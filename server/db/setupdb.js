const { Client } = require("pg");
require('dotenv').config();

const usersSetup = `
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    userid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR ( 255 ),
    firstName VARCHAR ( 255 ),
    lastName VARCHAR ( 255 ),
    admin BOOL,
    password VARCHAR ( 255 )
);
`;

const membershipSetup = `
DROP TABLE IF EXISTS memberships;
CREATE TABLE memberships (
    membershipid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    listid INTEGER,
    userid INTEGER
);
`;

const listSetup = `
DROP TABLE IF EXISTS lists;
CREATE TABLE lists (
    listid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    listName VARCHAR ( 255 ),
    eventDate DATE
);
`;

const itemsSetup = `
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    itemid INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    membershipid INTEGER,
    itemName VARCHAR ( 255 ),
    itemLink VARCHAR ( 5000 ),
    itemComments VARCHAR ( 5000 ),
    itemQtyReq INTEGER,
    itemQtyPurch INTEGER,
    createDate DATE,
    lastUpdateDate DATE
);
`;



async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.RENDERSTRING
  });
  await client.connect();

  await client.query(usersSetup);
  await client.query(membershipSetup);
  await client.query(listSetup);
  await client.query(itemsSetup);

  await client.end();
  console.log("done");
}

main();