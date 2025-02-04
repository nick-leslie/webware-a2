// FRONT-END (CLIENT) JAVASCRIPT HERE
//

const submit = async function( event ) {
    // stop form submission from trying to load
    // a new .html page for displapying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const group_name_value = document.querySelector( "#groupName" )
    const group_description_value = document.querySelector( "#groupDescription" )

    if(isLoggedIn() === false) {
      //todo add warning message
      updateWarningMessage("not logged in please log in to make a group")
      return;
    }

    const session = JSON.parse(get_cookie_value("session"))


    const json = {
      group_name: group_name_value.value,
      description:group_description_value.value,
      username: session.username,
    }
    console.log(json)
    const body = JSON.stringify( json )

    const response = await fetch( "/submit", {
      method:'POST',
      body
    })

    const response_json = await response.json()

    const groups_display_container = document.querySelector( "#groups" )
    groups_display_container.insertAdjacentHTML("afterbegin", response_json.html_template)
    console.log( "response_html:", response_json )
}

function updateWarningMessage(msg) {
  const warning_msg_div = document.querySelector( "#warningmessage")
  warning_msg_div.innerHTML = msg;
  //todo could do a fade here
}

window.onload = function() {
  try {
    add_button_click("#submit-group-info", submit)
    add_button_click("#login", login)
    add_button_click("#sighnup", signup)
    add_button_click("#logout", logout)
    update_logged_in_as()
  } catch(err) {

  }
}

function add_button_click(selector,on_click) {
  const button = document.querySelector(selector);
  if (button !== null) {
    button.onclick = on_click;
  }
}

async function signup(event) {
  console.log("sighnup started")
  event.preventDefault()
  const username = document.querySelector( "#username" ).value
  const password = document.querySelector( "#password" ).value
  const password_verification = document.querySelector( "#passwordValidation" ).value

  if(password !== password_verification) {
    //todo warning message
    updateWarningMessage("passwords dont match")
    return;
  }


  const json = {
    username:username,
    password:password
  }
  console.log(json)
  const body = JSON.stringify( json )

  const response = await fetch( "/signup", {
    method:'POST',
    body
  })
  const res_json = await response.json();
  if(res_json.logedin === true) {
    window.location.replace("/");
  }
}

async function login(event) {
  event.preventDefault()
  const username = document.querySelector( "#username" ).value
  const password = document.querySelector( "#password" ).value



  const json = {
    username:username,
    password:password
  }
  console.log(json)
  const body = JSON.stringify( json )

  const response = await fetch( "/login", {
    method:'POST',
    body
  })
  const res_json = await response.json();
  if(res_json.logedin === true) {
    console.log()
    window.location.replace("/");
  }
}

async function getGroups() {
  const response = await fetch( "/api/groups", {
      method:'GET',
  })
  console.log(await response.json())
}

async function join_group(group_name) {
  console.log(group_name)
  const session = JSON.parse(get_cookie_value("session"))

  const json = {
    username:session.username,
    group_name:group_name
  }
  console.log(json)
  const body = JSON.stringify(json)
  const response = await fetch( "/join", {
    method:'POST',
    body
  })
  const res_json = await response.json();
  console.log(res_json)
  const groups_html = res_json.map((group) => {
    return group.html_template
  })
  const group_container = document.querySelector( "#groups" )
  group_container.innerHTML = groups_html
}


function get_cookie_value(name) {
  const allCookies = document.cookie.split(";");
  console.log(allCookies);
  for (cookie of allCookies) {
    const cookie_key_value = cookie.split("=");
    console.log(cookie_key_value[0])
    if(cookie_key_value[0].trim() === name.trim()) {
      return cookie_key_value[1]
    }
  }
  console.log("reaching edn")
  return "";
}


function isLoggedIn() {
  const session_cookie = get_cookie_value("session");
  try {
    const session = JSON.parse(session_cookie)
    console.log(session_cookie)
    return session.login;
  } catch(err) {
    console.log(session_cookie)
    console.log(err)
    return false;
  }
}

function update_logged_in_as() {
  const session_cookie = get_cookie_value("session");
  const session = JSON.parse(session_cookie);
  const loggedInAs = document.querySelector( "#loggedinas" )

  loggedInAs.innerHTML = `username:${session.username}`;

}


function logout() {
  var Cookies = document.cookie.split(';');
   // set past expiry to all cookies
  for (var i = 0; i < Cookies.length; i++) {
     document.cookie = Cookies[i] + "=; expires="+ new Date(0).toUTCString();
  }
  console.log(document.cookie)
  const loggedInAs = document.querySelector( "#loggedinas" )

  loggedInAs.innerHTML = "";
}
