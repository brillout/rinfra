const {connection} = global.rinfra.postgres;
module.exports = {
  client: 'pg',
  connection,
};
