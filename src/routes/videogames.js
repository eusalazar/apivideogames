const  axios  = require ('axios');
const { Videogames, Genres, Platforms} = require ('../db.js');
const { VIDEOGAMES_API_KEY } = process.env;

//ME TRAIGO TODOS LOS VIDEOJUEGOS DE LA API
const getAllVideoGames = async () => {
    let promesas = []
    for (let index = 1; index < 5; index++) {
        const promesa = axios.get(`https://api.rawg.io/api/games?key=${ VIDEOGAMES_API_KEY }&page_size=25&page=${index}`)
        promesas.push(promesa);
    }
    
    promesas = await Promise.all(promesas)
    const results = []
    promesas.map(e => results.push(...e.data.results))

    const parseResult = (e) => ({////creo quna fn y le paso r como parametro
            id: e.id,
            name: e.name,
            image: e.background_image,
            platforms: e.platforms?.map(e => e.platform.name),
            genres: e.genres.map(e => e.name),
            rating:e.rating
   })
    const apiData = results.map(parseResult)
    const dbData = await Videogames.findAll({
        include: [
            {
                model: Genres,
                attributes: ["name"],
                through: {
                    attributes: []
                }
            },
            {
                model: Platforms,
                attributes: ["name"],
                through: {
                    attributes: []
                }
            }
        ]
    })
    return [...apiData, ...dbData] //abro el array para tener toda la info en un solo array
};

//HAGO UN REQUEST A LA API CON NAME INGRESADO COMO QUERY 
const getApi = async (name) => {
    const apiInfo = await axios.get(`https://api.rawg.io/api/games?search=${name}&key=${VIDEOGAMES_API_KEY}`)
    
    try{
    const results = await apiInfo.data.results.map((e) => {
        return {
            id: e.id,
            name: e.name,
            image: e.background_image,
            platform: e.platforms.map(e => e.platform.name).join(', '),
            genres: e.genres?.map(e => e.name),
            rating:e.rating
        }
    })
    return results;
    } catch (err) {
        console.log(err)
    }
};
//HAGO UNA REQUEST A LA BASE DE DATOS CON NAME INGRESADO COMO QUERY
const getBd = async (name) => {
    try {
    return await Videogames.findAll({
        where: {
            name:name
        },
        include: [ {
            model: Genres,
            attributes: ['name'],
            through: {
                attributes: []
            }
        },
        {
            model: Platforms,
            attributes: ['name'],
            through: {
                attributes: []
            }
        },
      
    ]
    })
} catch (err) {
    console.log(err)
}
    
};

//CONCATENO MIS DOS REQUESTS
const getAllName = async (name) => {
        const apiData = await getApi(name);
        const bdData = await getBd (name);
        const conc = apiData.concat(bdData)
        return conc;
    
};


const handler = async (req, res) =>{ //el query ?name(atributo)...(y lo q le pase x q )
    const { name } = req.query; 
    const allVideoGames = await getAllVideoGames();
    if(name){
        try{
            const searchName = await getAllName(name)
            if(searchName.length > 0){
                return res.status(200).send(searchName.slice(0,15))
            } else {
                res.status(400).send('No exite un videojuego con ese nombre')
            }
        } catch (err) {
            console.log(err)
        }
    } else {
        return res.send(allVideoGames)

    } 
}

module.exports = handler