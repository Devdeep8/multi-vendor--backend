require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const db = require("./config/database")

const app = express()

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public" )));

app.use(cors({
    credentials: true,
    origin : "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

const mainRoutes = require("./src/routes/main.routes");
// const { uploads } = require('./src/middleware/multer');


app.get("/",(req,res)=>{
    res.send("Hello this is form the best backend ")
})

app.use("/",mainRoutes)


app.listen(process.env.PORT,()=>{
    console.log(`server is live at ${process.env.FRONTEND_URL}`);
})