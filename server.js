const http = require("node:http");
const fs = require("node:fs");
const oauth = require("./oauth.js")
const { templateEngine} = require("./templateEngine.js")
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    dir  = "public/",
    port = 3000

const appdata = [

]

// let fullURL = ""
const server = http.createServer( function( request,response ) {
  switch (request.method) {
    case "GET":
      handleGet( request, response )
      break;
    case "POST":
        handlePost( request, response )
      break;
    default:
      break;
  }
    // The following shows the requests being sent to the server
    // fullURL = `http://${request.headers.host}${request.url}`
    // console.log( fullURL );
})

const handleGet = function( request, response ) {
    const filename = dir + request.url.slice( 1 )
    if (request.url === "/") {
      sendFile(response, "public/index.html")

    } else if (request.url === "/api/groups") {
      response.writeHead(200, "OK", { "Content-Type": "application/json" })
      response.end(JSON.stringify(appdata))
    }else{
        sendFile( response, filename )
    }
}

const handlePost = function( request, response ) {
  if (request.url == "/submit") {
    let dataString = ""

    request.on("data", function (data) {
      dataString += data
    })

    request.on("end", function () {
      const response_json = JSON.parse(dataString)
      console.log(response_json);
      //todo add validation
      const final_group_json = {
        ...response_json,
        html_template: `
          <div>
            <h1>Name:${response_json.group_name}</h1>
            <p>description:${response_json.description}</p>
            <p>members${1}</p>
          </div>
        `,
        members:[response_json.username]
      }
      appdata.push(final_group_json);

      // ... do something with the data here and at least generate the derived data
      response.writeHead(200, "OK", { "Content-Type": "application/json" })
      response.end(JSON.stringify(final_group_json))
    })
  } else {
        response.writeHead(404, "Page not found", {})
        response.end()
        return
  }
}


const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

          // status code: https://httpstatuses.com
          if(filename.split(".")[1] === "html") {
            templateEngine(content, [])
          }
          response.writeHeader( 200, { "Content-Type": type })
          response.end( content )

        } else {

          // file not found, error code 404
          response.writeHeader( 404 )
          response.end( "404 Error: File Not Found" )
        }
    })
}
//: Buffer<ArrayBufferLike>
//TODO do this later if we have time


// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
server.listen( process.env.PORT || port )




console.log("server running at http://localhost:"+port)
