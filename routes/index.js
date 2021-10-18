const express = require('express');
const router = express.Router();
const Parser = require('../parser');
const fs = require('fs');
/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/test', async (req,res) => {
  
  const html = JSON.parse( fs.readFileSync('zaglushka.txt') );
  res.json(html);
})

router.post('/coords', async (req,res) => {
  const {json} = req.body;
  fs.writeFileSync('./route.json', JSON.stringify(json));
  res.json(json);
})

router.post('/', async (req,res) => {
  const { url } = req.body;
  const html = await Parser.parse(url);

  res.json(html);
})

module.exports = router;
