const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 5000;
const {MONGOURI} =require('./keys')
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.on('connected',()=>{
    console.log('connected to mongo yeaahhh')
})
mongoose.connection.on('error',(err)=>{
    console.log('error connecting',err)
})
require('./models/user')
require('./models/post')
app.use(express.json())

app.use(require('./routes/auth'))
app.use(require('./routes/post'))

app.listen(PORT, () => {
    console.log("Server is running on Port: " + PORT);
});
