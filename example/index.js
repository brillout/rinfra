process.on('unhandledRejection', err => {throw err});

//const runPostgres = require('@rinfra/postgres');
const runPostgres = require('../postgres');

let knex;

main();

async function startDatabase() {
  const connection = await runPostgres();
  global.rinfra = {
    postgres: {
      connection,
    },
  };
  knex = require('./setup');
}

async function main() {
  await startDatabase();
  await createTable();
  await populate();
  const result = await knex.select().from(my_test_table);
  console.log(result);
  await destroyTable();
  await closeConnection();
}

const my_test_table = 'my_test_table';

async function createTable() {
  await (
    knex.schema.createTable(my_test_table, table => {
      table.increments('id').primary();
      table.string('content').notNullable();
    })
  );
}

async function populate() {
  await (
    knex(my_test_table).insert([
      {id: 1, content: 'wuiehqiwueh'},
      {id: 2, content: 'aaaaaaabbb'},
    ])
  );
}

async function destroyTable() {
  await (
    knex.schema.dropTable(my_test_table)
  );
}

async function closeConnection() {
  await knex.destroy();
}
