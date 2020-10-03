const router = require('express').Router()
let listaUsuarios = require('../login.json')
let dialog = require('dialog')

router.route('/firmFile')
    .post((req,res) => {
       // console.log(req.body)
      let {user, password} = req.body;

      if(listaUsuarios.find(c => c.usuario == user && c.password == password)){
        res.render('home');
      }else{
        dialog.err("usuario o pass equivocados","Login incorrecto");
        res.render('login');
      }
    })
module.exports = router;