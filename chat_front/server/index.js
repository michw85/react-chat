// Поднять вебсервер на NodeJs (далее Сервер) и установить соединение с Клиентом посредством websocket;
// ~ websocket / http (fetch / images)

const SERVER_PORT = 8080;
const http = require('http');
const fs = require('fs');
const WS = require('websocket').server;

const dbShot = {
    users: [
        { id: "1", name: "Анна ", avatar: "http://localhost:8080/img/avatar1.jpg" },
        { id: "4", name: "Сергей ", avatar: "http://localhost:8080/img/avatar2.jpg" },
        { id: "22", name: "Иван ", avatar: "http://localhost:8080/img/avatar3.jpg" },
        { id: "45", name: "Елена ", avatar: "http://localhost:8080/img/avatar4.jpg" }
    ],
    msg: {
        "1":  [{id:"11", to: "4", txt: "Привет Сергей" },  { id:"22", to: "4", txt: "Добрый день Анна" }],
        "4":  [{id:"12", to: "22", txt: "Привет Иван" }, { id:"23", to: "45", txt: "Добрый день Серегей" }],
        "22": [{id:"13", to: "45", txt: "Hello Helen" }, { id:"24", to: "1", txt: "Hi Ivan" }],
        "45": [{id:"14", to: "1", txt: "Hello Sergej" },  { id:"25", to: "22", txt: "Hi Helen" }]
    }
};

let dbMsgNew = {
    values: [
        {value: ""}
    ]
};

var userData = JSON.stringify(dbShot.users);

serverCore = (req, resp) => {
    // console.log( req.url ) ;
    var url = decodeURI(req.url.substr(1));
    if (fs.existsSync(url)) {
        fs.readFile(url, (err, data) => {
            resp.end(data);
        })
        return;
    }

    if (url.toLowerCase() == 'userlist') {
        resp.writeHead(200, {
            'Connection': 'Close',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        resp.end(userData);
        return;
    }
  
    resp.end('Not Found');
}

const httpServer = http.createServer(serverCore);
httpServer.listen(SERVER_PORT, () => { console.log("Server listening port " + SERVER_PORT); })

const ws = new WS({
    httpServer: httpServer
});

ws.on('request', (req) => {
    // console.log( req )
    if (req.resource == '/userlist') {
        var con = req.accept();
        con.sendUTF(userData);
    }
    for (let uid in dbShot.msg) {
        if (req.resource == '/usermsg/'+ uid) {
            var con = req.accept();
            con.sendUTF(JSON.stringify(dbShot.msg[uid]));
        }
    }

    if (req.resource == '/addmsg') {
        var con = req.accept();
        con.on("message",console.log)
        con.sendUTF( "Added" ) ;
    }
    for (let uid in dbMsgNew.values) {
        if (req.resource == '/usernewmsg/'+ uid) {
            var con = req.accept();
            con.sendUTF(JSON.stringify(dbMsgNew.values[uid]));
        }
    }
    
})