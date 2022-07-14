const  axios  = require ('axios');
const { Videogame, Genre, Platforms} = require ('../db.js');


const handler = async (req, res) => {
    const { name, description, image, released, rating, platforms, genres } = req.body;

    
    try {
        if(!name || !description || !released || !rating || !platforms || !genres ) {
            console.log(name, description, released, rating, platforms, genres)
            return res.status(403).send('Todos los attributos deben ser completados.')
        }
        if(isNaN(rating) || rating < 0 || rating > 5) {
            console.log('Rating debe ser un numero entre 1 y 5.', rating)

            return res.status(403).send('Rating debe ser un numero entre 1 y 5.')
        }
        if(image && image.length > 255) {
            console.log('No se acepta la url tan larga.', image)
            return res.status(403).send('No se acepta la url tan larga.')
        }
        const newGames = await Videogame.create({
            name,
            description,
            image,
            released,
            rating,
            platforms,
            genres,
            createInBD: true

        })
        
        const bdGenres = await Genre.findAll({ //devolvera las cadenas de  cada coincidencia en la cadena buscada            
            where : {name: genres}
        })
        const platformDb = await Platforms.findAll({
            where: {
                name: platforms
            }
        })
        
        newGames.addGenre(bdGenres)
        newGames.addPlatforms(platformDb)
        res.status(200).send(newGames)
    } catch (err) {
        console.log(err)
        return res.status(403).send('Se produjo un error')
    }
};

module.exports = handler;