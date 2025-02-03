// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
    // stop form submission from trying to load
    // a new .html page for displapying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault()

    const group_name_value = document.querySelector( "#groupName" )
    const group_description_value = document.querySelector( "#groupDescription" )


    const json = {
      group_name: group_name_value.value,
      description:group_description_value.value,
      username:"gaming"
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

window.onload = function() {
    const button = document.querySelector("#submit-group-info");
    button.onclick = submit;
    getGroups().then()
}


async function getGroups() {
  const response = await fetch( "/api/groups", {
      method:'GET',
  })
  console.log(await response.json())
}
