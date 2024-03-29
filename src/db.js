require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { VIDEOGAMES_API_KEY } = process.env;

const {
  DATABASE_URL
} = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Videogames, Genres, Platforms } = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Videogames.belongsToMany(Genres, { through: "videogames_genres" });
Genres.belongsToMany(Videogames, { through: "videogames_genres" });

Videogames.belongsToMany(Platforms, { through: "videogameplatform" })
Platforms.belongsToMany(Videogames, { through: "videogameplatform" })

const initiData = async () => {
  const infoApi = await axios.get( `https://api.rawg.io/api/genres?key=${ VIDEOGAMES_API_KEY }`)
  const gamesGenres = await infoApi.data.results;
  gamesGenres.map(e => {
      return Genres.findOrCreate({
          where: {
              name: e.name,
          }
      })
  });
}
initiData()


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
