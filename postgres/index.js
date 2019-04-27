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

  const container_name = 'rinfra-postgres-12345';
//const container_name = 'rinfra-postgres_PENDING';

  const info = {
    host,
    port,
    user,
    password,
    database,
    charset,
  };

  await tmp({database, container_name, user});
  return info;

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

async function tmp({user, database, container_name}) {
  const containers = await docker.listContainers({all: true});
  console.log(containers);
  const container_info = (
    containers
    .find(c => c.Names.includes('/'+container_name))
  );
  assert.internal(container_info, {containers, container_name});
  const container = docker.getContainer(container_info.Id);
  assert.internal(container, {containers, container_name});
  console.log("BEG");
//const Cmd = ['psql -c "CREATE DATABASE '+database+'"'];
  /*
  const Cmd = ['date'];
  const res = await container.exec({
    Cmd,
    User: user,
    AttachStdout: true,
    AttachStdin: true,
  }, (err, exec) => {
    exec.start(
  });
*/
/*
  const fs = require('fs');
    await container.exec({Cmd: ['shasum', '-'], AttachStdin: true, AttachStdout: true}, function(err, exec) {
        console.log("S1");
      exec.start({hijack: true, stdin: true}, function(err, stream) {
        // shasum can't finish until after its stdin has been closed, telling it that it has
        // read all the bytes it needs to sum. Without a socket upgrade, there is no way to
        // close the write-side of the stream without also closing the read-side!
        console.log("S2");
        fs.createReadStream('afiloo.txt', 'binary').pipe(stream.output);

        // Fortunately, we have a regular TCP socket now, so when the readstream finishes and closes our
        // stream, it is still open for reading and we will still get our results :-)
        docker.modem.demuxStream(stream.output, process.stdout, process.stderr);
        console.log("S3");
      });
    });
*/
	runExec(container);
  await sleep();
  console.log("BEG2");
  console.log(res);
  console.log(Cmd);
  console.log("END");
}

function sleep() {
  let resolve;
  const promise = new Promise(r => resolve = r)
  setTimeout(resolve, 3*1000);
  console.log("T");
  return promise;
}

/**
 * Get env list from running container
 * @param container
 */
async function runExec(container) {

  var options = {
//  Cmd: ['bash', '-c', 'echo test $VAR'],
 // Cmd: ['psql', '-c', 'CREATE DATABASE '+'newd555'+';'],
    Cmd: ['date'],
    Env: ['VAR=ttslkfjsdalkfj'],
		User: 'postgres',
    AttachStdout: true,
    AttachStderr: true
  };

  const exec = await container.exec(options);
let err;
//container.exec(options, function(err, exec) {
    if (err) return;
	//exec.start();
    exec.start(function(err, stream) {
      if (err) return;

      container.modem.demuxStream(stream, process.stdout, process.stderr);

      exec.inspect(function(err, data) {
        if (err) return;
        console.log(data);
      });
    });
//});
}
