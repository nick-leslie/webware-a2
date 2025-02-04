const http = require("node:http");
const fs = require("node:fs");
const bcrypt = require('bcrypt')
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    dir  = "public/",
    port = 3000

const appdata = new Map()

const users =  new Map()

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

const handleGet = function (request, response) {
  const filename = dir + request.url.slice(1)
  const url = request.url.split("?")[0];
    if (url === "/") {
      sendFile(response, "public/index.html")
    } else if (url=== "/login") {
      sendFile(response, "public/login.html")
    } else if (url === "/signup") {
      sendFile(response, "public/signup.html")
    } else if (url === "/api/groups") {
      response.writeHead(200, "OK", { "Content-Type": "application/json" })
      response.end(JSON.stringify(appdata))
    }else{
        sendFile( response, filename )
    }
}

function join_group(request,response) {
  let dataString = ""

  request.on("data", function (data) {
    dataString += data
  })

  request.on("end", function () {
    const response_json = JSON.parse(dataString)
    const group_json = appdata.get(response_json.group_name)
    const group_member = group_json.members
    group_member.push(response_json.username);
    //this is gross but I save this till last min
    const template = `
      <div>
        <h1>Name:${group_json.group_name}</h1>
        <p>description:${group_json.description}</p>
        <p>orginiser:${group_json.username}</p>
        <button class="joinGroup" onclick="join_group('${group_json.group_name}')">Join Group</button>
        <div>
          <p>Members</p>
          <div class="grid">
            ${group_member.map((member) => `<div>${member}</div>`).join("")}
          </div>
        </div>
      </div>
    `
    console.log(template)
    //todo add validation
    const final_group_json = {
      ...group_json,
      description:group_json.description,
      html_template: template,
      members:group_member
    }
    appdata.set(response_json.group_name,final_group_json);

    // ... do something with the data here and at least generate the derived data
    response.writeHead(200, "OK", { "Content-Type": "application/json" })
    response.end(JSON.stringify(Array.from(appdata.values())))
  })
}

const handlePost = function( request, response ) {
  if (request.url == "/submit") {
    handle_submit(request, response)
  } else if (request.url==="/login") {
    authenticate(request,response)
  } else if (request.url==="/signup") {
    sighnup(request,response)
  } else if (request.url === "/join") {
    join_group(request,response)
  } else {
    response.writeHead(404, "Page not found", {})
    response.end()
    return
  }
}

function handle_submit(request,response) {
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
          <p>orginiser:${response_json.username}</p>
          <button class="joinGroup" onclick="join_group('${response_json.group_name}')">Join Group</button>
          <div>
            <p>Members</p>
            <div class="grid">
              ${response_json.username}
            </div>
          </div>
        </div>
      `,
      members:[response_json.username]
    }
    appdata.set(response_json.group_name,final_group_json);

    // ... do something with the data here and at least generate the derived data
    response.writeHead(200, "OK", { "Content-Type": "application/json" })
    response.end(JSON.stringify(final_group_json))
  })
}


const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

          // status code: https://httpstatuses.com
          if(filename.split(".")[1] === "html") {
            //this is so that the groups are rendered when they first enter the page.
            const group_string = Array.from(appdata.values()).map((data) => { return data.html_template }).join("\n");
            const ssr = content.toString().replace("{groups}", group_string)
            response.writeHeader( 200, { "Content-Type": type })
            response.end( ssr )
            return
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

function sighnup(request,response) {
  let dataString = ""

  request.on("data", function (data) {
    dataString += data
  })

  request.on("end", function () {
    const response_json = JSON.parse(dataString)
    console.log(response_json);
    bcrypt.genSalt(10,(err,salt) => {
      if(err) {
        console.log("failed on salt " + err.message)
      }
      bcrypt.hash(response_json.password,salt,(err,hash) => {
        if(err) {
          console.log("failed on hash " + err.message)
        }
        users.set(response_json.username, hash)
        create_session(response,response_json);
      })
    })
  })
}

async function authenticate(request,response) {
  console.log("authenticating")
  let dataString = ""

  request.on("data", function (data) {
    dataString += data
  })
  request.on("end", function () {
    const request_json = JSON.parse(dataString)
    const user_hash = users.get(request_json.username);
    if(user_hash === undefined) {
      console.log("cant find user")
      //todo error handle
      return;
    }
    bcrypt.compare(request_json.password, user_hash).then((authenticated) => {
    if(authenticated === false) {
        console.log("cant authenticate")
        //todo error handle
        return;
      }
      create_session(response,request_json);
    })
  })
}

function create_session(response,response_json) {
  const sesion_response = {
    username:response_json.username,
    logedin:true
  }
  //todo should the cookies be
  response.writeHead(200, "OK", {
    "Content-Type": "application/json",
    'Set-Cookie': [
      `session=${JSON.stringify(sesion_response)}; Max-Age=100000;`,
    ]
  })
  response.end(JSON.stringify(sesion_response))
}

//: Buffer<ArrayBufferLike>
//TODO do this later if we have time


// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
server.listen( process.env.PORT || port )




console.log("server running at http://localhost:"+port)
