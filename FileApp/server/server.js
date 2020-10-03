const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const uploadRouter = require('../routes/uploads')
const loginRouter = require('../routes/login')
// const globby = require('globby')
const https = require('https');
const fs = require('fs');
const bodyParser = require("body-parser");

let app = express()
let port = 3000;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, '../views/layouts/')
}));
app.set('view engine', 'hbs');

app.use(uploadRouter);
app.use(loginRouter);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.use(express.static(path.join(__dirname, '../public')))

const certificate = https.createServer({
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
}, app);

app.route('/')
    .get((req,res) => {
        // res.send("imageApp")
        res.render('login', {
            title: 'Login',
            condition: false
        })
    })

//app.listen(port, ()=>console.log(`http://localhost:${port}`))

certificate.listen(port, function(){
    console.log("My http server listening on port " + port + "...");
});
