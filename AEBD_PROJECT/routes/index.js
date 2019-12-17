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
  axios.get("http://localhost:8080/ords/grupo06/users/")
      .then(dados => {
        //console.log(dados);
       // console.log(dados.data.items[0]);
        res.render('users', {users: dados.data.items});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
});


router.get('/privs', function(req, res, next) {
  var user = req.query.user
          axios.get('http://localhost:8080/ords/grupo06/user_privileges/?q={"users_username":{"$eq":"'+user+'"}}')
          .then(dados => {res.render('privs',{username:user,privs: dados.data.items})})
          .catch(erro => {res.status(500).render('error', {error: erro})})
});

router.get('/roles', function(req, res){
  var user = req.query.user
  axios.get('http://localhost:8080/ords/grupo06/userroles/?q={"name_user":{"$eq":"'+user+'"}}')
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
  axios.get("http://localhost:8080/ords/grupo06/cpu/")
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
  console.log("BATATTS")
  axios.get("http://localhost:8080/ords/grupo06/memory/")
      .then(dados => {
        //console.log(dados.data.items)
        var used = []
        var total  = []
        var data = []
        for(i in dados.data.items){
          used.push(dados.data.items[i].total-dados.data.items[i].free)
          total.push(dados.data.items[i].total)
          data.push(dados.data.items[i].timestamp)
        }
        res.render('memory', {used: used,total:total, datas:data});
      })
      .catch(erro => {res.status(500).render('error', {error: erro})})
})

router.get('/sessions', function(req, res){
  oracledb.getConnection(con)
          .then(c => {
          c.execute("select SID, USERNAME, PROGRAM " +
                    " from v$session, (SELECT CURRENT_TIMESTAMP FROM dual) c " + 
                    "WHERE USERNAME IS NOT NULL" +
                    " order by 1")
              .then(dados => {
                res.render('session', {sessions : dados})
                c.close()
              })
              .catch(erro => {res.status(500).render('error', {error : erro}); c.close()})
              
          })
          .catch(erro => res.status(500).render('error', {error : erro}))
})

module.exports = router;
