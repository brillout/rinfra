const Docker = require('dockerode');
const docker = new Docker();
const assert = require('reassert');

module.exports = runPostgres;

async function runPostgres() {
  const host = 'localhost';
  const port = '5432';
  const user = 'postgres';
  const password = 'not-safe-pw';
  const database = 'my_default_database';
  const charset = 'UTF8_GENERAL_CI';

//const container_name = 'rinfra-postgres-12345';
  const container_name = 'rinfra-postgres_PENDING';

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

  await sleep();
  console.log('first sleep done');
  /*
  */

  await runExec(
    container,
    {
      Cmd: ['psql', '-c', 'CREATE DATABASE '+database+';'],
      User: user,
   // AttachStdout: true,
      AttachStderr: true
    },
  );
  await sleep();
  console.log('second sleep done');

  return info;
}

async function isAlreadyRunning(container_name) {
  const containers = await docker.listContainers({all: true});
  return (
    containers
    .some(c => c.Names.includes('/'+container_name))
  );
}

async function runExec(container, options) {
  const exec = await container.exec(options);
  const stream = await exec.start();
  container.modem.demuxStream(stream.output, process.stdout, process.stderr);
}

function sleep() {
  let resolve;
  const promise = new Promise(r => resolve = r)
  setTimeout(resolve, 5*1000);
  return promise;
}
