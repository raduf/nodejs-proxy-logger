var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Listen for the `proxyRes` event on `proxy`.
//
proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    
    //maybe I can intercept it on some response emitted events?
    proxyRes.on('data', function(body){
        try {
          console.log(body.toString())    
        } catch(e){
          //ERROR
        }
      })

  });


//
// Listen for the `open` event on `proxy`.
//
proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here
    proxySocket.on('data', function(data){
        console.log('logging data', data)
    });
  });


  proxy.on('proxyResponse', function (req, res, response) {

    res.setHeader('x-new-cust-field', 'mycustomfield');    //Able to add custom headers fields
    res.setHeader('x-cust-field', 'editedcustomfield');    //This makes no changes in the response header
  
    //maybe I can intercept it on some response emitted events?
    response.on('data', function(body){
      try {
  
        res.getHeader('x-cust-field') //can see all the values written by proxied server 
        res.setHeader('x-cust-field', 'editedcustomfield');    //Can't set headers after they are sent.
  
      } catch(e){
        //ERROR
      }
    })
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