const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (user, secret, expiresIn) => {
    const {username, email} = user;
    return jwt.sign({username, email}, secret, {expiresIn});
};

exports.resolvers = {
    Query: {
        getAllRecipes: async (_, args, {Recipe}) => {
            return await Recipe.find();
        },
        getCurrentUser: async (_, args, {currentUser, User}) => {
            if (!currentUser) {
                return null;
            }
            const user = await User.findOne({username: currentUser.username}).populate({
                path: 'favorites',
                model: 'Recipe'
            });
            return user;
        }
    },
    Mutation: {
        addRecipe: async (_, {name, description, category, instructions, username}, {Recipe}) => {
            return await new Recipe({
                name,
                description,
                category,
                instructions,
                username
            }).save();
        },

        signUpUser: async (_, {username, email, password}, {User}) => {
            const user = await User.findOne({username});
            if (user) {
                throw new Error('User already exists')
            }
            const newUser = await new User({
                username,
                email,
                password
            }).save();
            return {token: createToken(newUser, process.env.SECRET, '1hr')}
        },

        signInUser: async (_, {username, password}, {User}) => {
            const user = await User.findOne({username});
            if (!user) {
                throw new Error('User not found, Please check your credentials')
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                throw new Error('User not found, Please check your credentials')
            }

            return {token: createToken(user, process.env.SECRET, '1hr')}
        },
    }
};
