const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {ApolloServer} = require('apollo-server-express');

require('dotenv').config();

const Recipe = require('./models/Recipe');
const User = require('./models/User');

const {makeExecutableSchema} = require('graphql-tools');

const {typeDefs} = require('./schema');
const {resolvers} = require('./resolvers');

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

// connect to database
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("Database connected"))
    .catch(err => console.error(err));

// initial the project
const app = express();
const path = '/graphql';

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};


app.use(cors(corsOptions));

// SET UP JWT AUTHENTICATION GRAPHQL
app.use(async (req, res, next) => {
    const token = req.headers['authorization'];
    if (token !== "null") {
        try {
            const currentUser = await jwt.verify(token, process.env.SECRET);
            req.currentUser = currentUser;
        } catch (e) {
        }
    }
    next();
});

const server = new ApolloServer({
    schema,
    context: ({req}) => {
        return {
            Recipe,
            User,
            currentUser: req.currentUser

        }
    }
});

server.applyMiddleware({app, path});

const PORT = process.env.PORT || 4444;


app.listen({port: PORT}, () => console.log(`Server listening on PORT: ${PORT}${server.graphqlPath}`));
