const infosRoute = require('../routes/infos.js');
const authRoute = require('../routes/auth.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const err = require('../middleware/err.js');
const cors = require('cors');

const corsOptions = {
    origin: '*',
};

module.exports = function (app) {
    app.use(cors(corsOptions));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cookieParser())
    app.use('/api/', infosRoute);
    app.use('/api/', authRoute);
    app.use(err)
}