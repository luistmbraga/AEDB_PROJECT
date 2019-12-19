var express = require('express');
var router = express.Router();
const oracledb = require('oracledb');
const axios = require('axios')

const con = {
  user          : "system",
  password      : "oracle",
  connectString : "//localhost/orcl"
};

router.get('/', function(req, res) {
  res.render('index')
})

router.get('/databases', function(req, res, next) {
      axios.get("http://localhost:8080/ords/grupo06/basedados/")
      .then(dados => {
        //console.log(dados);
        //console.log(dados.data.items[0]);
        res.render('databases', {databases: dados.data.items[0]})
       
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})

});


/* GET home page. */
router.get('/users', function(req, res, next) {
  axios.get("http://localhost:8080/ords/grupo06/users/?limit=1500")
      .then(dados => {
        //console.log(dados);
       // console.log(dados.data.items[0]);
        res.render('users', {users: dados.data.items});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
});


router.get('/privs', function(req, res, next) {
  var user = req.query.user
          axios.get('http://localhost:8080/ords/grupo06/user_privileges/?q={"users_username":{"$eq":"'+user+'"}}&limit=1500')
          .then(dados => {res.render('privs',{username:user,privs: dados.data.items})})
          .catch(erro => {res.status(500).render('error', {error: erro})})
});

router.get('/roles', function(req, res){
  var user = req.query.user
  axios.get('http://localhost:8080/ords/grupo06/userroles/?q={"name_user":{"$eq":"'+user+'"}}&limit=1500')
  .then(dados => {res.render('roles',{username:user,roles: dados.data.items})})
  .catch(erro => {res.status(500).render('error', {error: erro})})

})

router.get('/tablespaces', function(req, res, next) {
  axios.get("http://localhost:8080/ords/grupo06/tablespaces/")
      .then(dados => {
      //  console.log(dados.data.items)
        res.render('tablespaces', {tablespaces: dados.data.items});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
});


router.get('/datafiles', function(req, res, next) {
  var tablespace = req.query.tablespace
  axios.get('http://localhost:8080/ords/grupo06/datafiles/?q={"name_ts":{"$eq":"'+tablespace+'"}}')
      .then(dados => {
       // console.log(dados.data.items)
        res.render('datafiles', {datafiles: dados.data.items});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
});


router.get('/cpu', function(req, res){
  axios.get('http://localhost:8080/ords/grupo06/cpu/?q={"$orderby":{"ID_C":"DESC"}}')
      .then(dados => {
        //console.log(dados.data.items)
        var datas = []
        var usages = []
        for(i in dados.data.items){
          datas.push(dados.data.items[i].timestamp)
          usages.push(dados.data.items[i].usage)
          
        }
        console.log(datas)
        console.log(usages)
        res.render('cpu', {datas: datas,usages:usages});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
})

router.get('/memory', function(req, res){
  axios.get('http://localhost:8080/ords/grupo06/memory/?q={"$orderby":{"ID_M":"DESC"}}')
      .then(dados => {
        //console.log(dados.data.items)
        var used = []
        var total  = []
        var data = []
        for(i in dados.data.items){
          used.push(dados.data.items[i].total - dados.data.items[i].free)
          total.push(dados.data.items[i].total)
          data.push(dados.data.items[i].timestamp)
        }
        res.render('memory', {used: used,total:total, datas:data});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
})

router.get('/sessions', function(req, res){
  axios.get('http://localhost:8080/ords/grupo06/session_count/?q={"$orderby":{"ID":"DESC"}}&limit=1500')
  .then(dados0 => {
    var datas = []
    var counts = []
    for(i in dados0.data.items){
      datas.push(dados0.data.items[i].timestamp)
      counts.push(dados0.data.items[i].count)
      
    }
    console.log(datas)
    axios.get('http://localhost:8080/ords/grupo06/sessions/?q={"atualizado":{"$eq":1}}')
      .then(dados1 => {
        if(dados1.data.items.lenght == 0)
        res.redirect("/sessions")
        res.render('session', {datas: datas,counts: counts,ativas:dados1.data.items});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
  })
  .catch(erro => {res.status(500).render('error', {error: erro})})
})

module.exports = router;
