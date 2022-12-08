const mongoose = require('mongoose');
const config = require('config');
const db = config.get("mongoURI");

// connect to DB
const connectDB = async () => {

    // Try/Catch if database fails to connect
    try{
        await mongoose.connect(db);

        console.log('MongoDB Connected')
    }catch(e){
        console.error(e.message);

        process.exit(1);
    }
}

module.exports = connectDB;