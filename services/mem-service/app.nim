import std/net, std/strutils, std/json, std/strformat, std/os

var memoryValue: float = 0.0

proc main() =
  let port = 5000
  var server = newSocket()
  server.setSockOpt(OptReuseAddr, true)
  server.bindAddr(Port(port), "0.0.0.0")
  server.listen()
  
  echo fmt"Listening on port {port}..."

  while true:
    var client: Socket
    new(client)
    server.accept(client)
    let line = client.recvLine() # GET /api/mem/ HTTP/1.1
    
    # Very basic parsing
    var reqMethod = ""
    var path = ""
    if line.len > 0:
      let parts = line.split(' ')
      if parts.len >= 2:
        reqMethod = parts[0]
        path = parts[1]

    # Read headers to find Content-Length
    var contentLength = 0
    while true:
      let headerLine = client.recvLine()
      if headerLine == "\r\n" or headerLine == "": break
      if headerLine.startsWith("Content-Length: "):
        try:
          contentLength = parseInt(headerLine.substr(16))
        except:
          discard

    var body = ""
    if contentLength > 0:
      body = client.recv(contentLength)

    # Routing
    var responseBody = ""
    var status = "200 OK"

    try:
      if reqMethod == "GET":
         responseBody = fmt"{{\""value\"": {memoryValue}}}"
      
      elif reqMethod == "POST":
        if "clear" in path:
          memoryValue = 0.0
          responseBody = fmt"{{\""value\"": {memoryValue}}}"
        else:
          let jsonNode = parseJson(body)
          let val = jsonNode["value"].getFloat()
          memoryValue += val
          responseBody = fmt"{{\""value\"": {memoryValue}}}"
    except:
      status = "500 Internal Server Error"
      responseBody = "{\"error\": \"Something went wrong\"}"
      echo "Error processing request: " & getCurrentExceptionMsg()

    echo fmt"Sending response: {responseBody}"

    let response = fmt"HTTP/1.1 {status}" & "\r\n" &
                   "Content-Type: application/json\r\n" &
                   "Access-Control-Allow-Origin: *\r\n" &
                   fmt"Content-Length: {responseBody.len}" & "\r\n" &
                   "\r\n" &
                   responseBody

    client.send(response)
    client.close()

main()
