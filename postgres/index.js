const Docker = require('dockerode');
const docker = new Docker();

module.exports = runPostgres;

async function runPostgres() {
  const host = 'localhost';
  const port = '5432';
  const user = 'postgres';
  const password = 'not-safe-pw';
  const database = 'my_default_database';
  const charset = 'UTF8_GENERAL_CI';

  const container_name = 'rinfra-postgres-12345';

  const info = {
    host,
    port,
    user,
    password,
    database,
    charset,
  };

  if( await isAlreadyRunning(container_name) ) {
    return info;
  }

  const container = (
    await docker.createContainer({
      name: container_name,
      Image: 'postgres',
      ExposedPorts: {
        '5432/tcp': {},
      },
      Hostconfig: {
        PortBindings: {
          '5432/tcp': [{
            HostPort: port,
          }],
        },
      },
      Env: [
        "POSTGRES_PASSWORD="+password,
      ],
    })
  );

  await container.start();

  await container.exec({
    Cmd: ['psql -c "CREATE DATABASE '+database+'"'],
    User: user,
  });

  return info;
}

async function isAlreadyRunning(container_name) {
  const containers = await docker.listContainers({all: true});
  console.log(containers);
  return (
    containers
    .some(c => c.Names.includes('/'+container_name))
  );
}
