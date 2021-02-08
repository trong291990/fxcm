const io = require('socket.io-client');
const EventEmitter = require('events');
const querystring = require('querystring');

const protocol = 'https'
const protoPackage = require(protocol);

function api({ token, isDemo }) {
  const port = 443
  const host = `api${isDemo ? '-demo' : ''}.fxcm.com`
  const requestHeaders = {
    'User-Agent': 'request',
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const cli = new EventEmitter();
  let globalRequestID = 1

  cli.on('prompt', () => {
    process.stdout.write('> ');
  })

  cli.on('exit', () => {
    process.exit();
  })

  // loading of extra modules
  cli.on('load', (params) => {
    if (typeof (params.filename) === 'undefined') {
      console.log('command error: "filename" parameter is missing.')
    } else {
      var test = require(`./${params.filename}`);
      test.init(cli, socket);
    }
  })

  // helper function to send parameters in stringified form, which is required by FXCM REST API
  cli.on('send', (params) => {
    if (typeof (params.params) !== 'undefined') {
      params.params = querystring.stringify(params.params);
    }
    cli.emit('send_raw', params);
  })

  // will send a request to the server
  cli.on('send_raw', (params) => {
    // avoid undefined errors if params are not defined
    if (typeof (params.params) === 'undefined') {
      params.params = '';
    }

    // method and resource must be set for request to be sent
    if (typeof (params.method) === 'undefined') {
      console.log('command error: "method" parameter is missing.');
    } else if (typeof (params.resource) === 'undefined') {
      console.log('command error: "resource" parameter is missing.');
    } else {
      request_processor(params.method, params.resource, params.params, params.callback);
    }
  })

  function getNextRequestID() {
    return globalRequestID++;
  }

  function default_callback(statusCode, requestID, data) {
    if (statusCode === 200) {
      try {
        var jsonData = JSON.parse(data);
      } catch (e) {
        console.log('request #', requestID, ' JSON parse error:', e);
        return;
      }
      console.log('request #', requestID, ' has been executed:', JSON.stringify(jsonData, null, 2));
    } else {
      console.log('request #', requestID, ' execution error:', statusCode, ' : ', data);
    }
  }

  function request_processor(method, resource, params, callback) {
    const requestID = getNextRequestID();

    if (typeof (callback) === 'undefined') {
      callback = default_callback;
      console.log('request #', requestID, ' sending');
    }

    if (typeof (method) === 'undefined') {
      method = "GET";
    }

    // GET HTTP(S) requests have parameters encoded in URL
    if (method === "GET") {
      resource += '/?' + params;
    }

    const req = protoPackage.request({
      host: host,
      port: port,
      path: resource,
      method: method,
      headers: requestHeaders
    }, (response) => {
      var data = '';
      response.on('data', (chunk) => data += chunk); // re-assemble fragmented response data
      response.on('end', () => {
        callback(response.statusCode, requestID, data);
      });
    }).on('error', (err) => {
      callback(0, requestID, err); // this is called when network request fails
    });

    // non-GET HTTP(S) reuqests pass arguments as data
    if (method !== "GET" && typeof (params) !== 'undefined') {
      req.write(params);
    }
    req.end();
  }

  this.authenticate = () => {
    const uri = protocol + '://' + host + ':' + port
    socket = io(uri, {
      query: querystring.stringify({
        access_token: token
      })
    });
    // fired when socket.io connects with no errors
    socket.on('connect', () => {
      console.log('Socket.IO session has been opened: ', socket.id);
      requestHeaders.Authorization = 'Bearer ' + socket.id + token;
    });
    // fired when socket.io cannot connect (network errors)
    socket.on('connect_error', (error) => {
      console.log('Socket.IO session connect error: ', error);
    });
    // fired when socket.io cannot connect (login errors)
    socket.on('error', (error) => {
      console.log('Socket.IO session error: ', error);
    });
    // fired when socket.io disconnects from the server
    socket.on('disconnect', () => {
      console.log('Socket disconnected, terminating client.');
      process.exit(-1);
    });
  }

  process.stdin.on('data', function (data) {
    var input = data.toString().trim();

    // if the line was empty we don't want to do anything
    if (input === '') {
      cli.emit('prompt');
      return;
    }

    // split input into command and parameters
    var inputloc = input.search('{');
    if (inputloc === -1) {
      inputloc = input.length;
    }
    var command = input.substr(0, inputloc).trim();
    var params = input.substr(inputloc).trim();

    // command must be registered with cli
    if (cli.eventNames().indexOf(command) >= 0) {
      if (params.length > 0) {
        try {
          process.stdin.on('data', function (data) {
            var input = data.toString().trim();

            // if the line was empty we don't want to do anything
            if (input === '') {
              cli.emit('prompt');
              return;
            }

            // split input into command and parameters
            var inputloc = input.search('{');
            if (inputloc === -1) {
              inputloc = input.length;
            }
            var command = input.substr(0, inputloc).trim();
            var params = input.substr(inputloc).trim();

            // command must be registered with cli
            if (cli.eventNames().indexOf(command) >= 0) {
              if (params.length > 0) {
                try {
                  cli.emit(command, JSON.parse(params));
                } catch (e) {
                  console.log('could not parse JSON parameters: ', e);
                }
              } else {
                cli.emit(command, {});
              }
              cli.emit('prompt');
            } else {
              console.log('command not found. available commands: ', cli.eventNames());
            }
          })
          cli.emit(command, JSON.parse(params));
        } catch (e) {
          console.log('could not parse JSON parameters: ', e);
        }
      } else {
        cli.emit(command, {});
      }
      cli.emit('prompt');
    } else {
      console.log('command not found. available commands: ', cli.eventNames());
    }
  })

  return this
}

module.exports = api
