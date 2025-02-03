function templateEngine(html_content_buffer,context) {
  console.log("begining template")
  const templates=[]
  let current_template = {
    content:"",
    childten:[]
  }
  for (char of html_content_buffer.toString()) {
    if(char === "{") {
      current_template = {
        content:"",
        childten:[]
      }
    } else if (char === "}"){

    }
  }
  //console.log(html_content.split("{"))
}

function tokkeniser(html_content_buffer) {
  for (char of html_content_buffer.toString()) {
    switch (char) {
      case "":
        break;
      case "{":
        break;
      case "}":
        break;
      default:
        break;
    }
  }
  
}

//returns a parsed file structure
function parseFile(token) {
  //todo parse file
}

//takes in a parsed file and a context
function evaluateFile(parsed,supplied_context) {

}

module.exports = {templateEngine}
