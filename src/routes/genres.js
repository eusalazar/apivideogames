const { Genre } = require ('../db.js');

const handler = async (req, res) => {
    try {
        const allGenres = await Genre.findAll();
        return res.status(200).json(allGenres);
        
    } catch (err) {
        console.log(err)
    }
};

module.exports = handler;