var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs');
//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

proxy.on("proxyReq", function(proxyReq, req){
  reqBody = ''

  req.on("data", function(body){
    console.log("in req data" + reqBody)
    reqBody += body
  })

  req.on("end", function(){
    if(req.method == 'POST'){
      console.log("in req end for POST: " + reqBody)
      req.myBody = reqBody
    }
  })
})

//
// Listen for the `proxyRes` event on `proxy`.
//
proxy.on('proxyRes', function (proxyRes, req, res) {
  var toLog = "",
      requestBody = "",
      responseBody = ""
  toLog += "Request: \n"

  requestToLog = {'method': req.method, 'url':req.url, 'headers':req.headers}

  toLog += JSON.stringify(requestToLog, true, 2) + "\n"

  if(req.myBody){
    toLog += "Request Body: \n"
    toLog += req.myBody + "\n"
  }


  toLog += "Response: \n"

  toLog += JSON.stringify(proxyRes.headers, true, 2) + "\n";
    
    //maybe I can intercept it on some response emitted events?
    proxyRes.on('data', function(body){
        try {
          //console.log(body.toString())
          responseBody += body.toString()
        } catch(e){
          //ERROR
        }
      })

    //at the end, save the log to a file
    proxyRes.on("end", function(){
      toLog += "Response Body: \n"
      toLog += responseBody

      var date = new Date()//, hour = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds(), millis = date.getMilliseconds(); 
      var path = "logs/" + date.toISOString().replace('T', '_').replace(':', '_').replace(':', '_') + ".log"; 
      fs.writeFile(path, toLog, (err) =>{
        if (err) {
          return console.error(err); 
        }
      
        console.log('response saved');
      })
    })
});



proxy.on('end', function() {
  console.log('proxied');
})

//
// Listen for the `open` event on `proxy`.
//
proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here
    proxySocket.on('data', function(data){
        console.log('logging data', data)
    });
  });


//
// Listen for the `close` event on `proxy`.
//
proxy.on('close', function (res, socket, head) {
    // view disconnected websocket connections
    console.log('Client disconnected');
  });

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, { target: 'http://127.0.0.1:8088' });

});
console.log("listening on port 9090")
server.listen(9090);