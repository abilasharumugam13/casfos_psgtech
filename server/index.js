const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require("./routes/assetRoutes");
const facultyRoutes = require('./routes/facultyRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/faculty', facultyRoutes);

const port = process.env.PORT || 3001;

const start = async () => {
    try {
        await dbConnect();
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        console.error(error);
    }
};

start();
