const { Router } = require('express');
const axios = require('axios');
const { Videogames, Genres } = require ('../db.js');
const { VIDEOGAMES_API_KEY } = process.env;

const router = Router();

//OBTENGO EL ID DE LA API

const getApiId = async (id) => {
    try {
        const apiId = await axios.get(`https://api.rawg.io/api/games/${id}?key=${ VIDEOGAMES_API_KEY }`);
        return apiId.data;
    } catch (err) {
        console.log(err)
        return null;
    }
};

//OBTEGO EL ID LA BASE DE DATOS

const getBdId = async (id) => {
    const infoId = await Videogames.findByPk(id, {include: Genres});//obtiene la clave princ de la tabla
    return infoId
};

//CONCATENO 

const getAllId = async (id) => {
    const apiId = await getApiId(id);
    const bdId = await getBdId (id);
    const result = [];
    if (apiId) result.push(apiId)
    if (bdId) result.push(bdId);
    return result;
}

//OBTENGO LA RUTA POR ID DE UN VIDEOJUEGOS EN PARTICULAR 

const handler = async (req, res) => {
    const { id } = req.params;
    try {
        const results = await getAllId(id);
        if(results.length > 0) {
            return res.status(200).send(results)
        } else {
            return res.status(404).send('No existe un videojuego ')
        }
    } catch (err) {
        console.log(err)
        return res.status(404).send('Se produjo un error')
    }
}

module.exports = handler