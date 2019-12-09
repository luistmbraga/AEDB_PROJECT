var express = require('express');
var router = express.Router();
const oracledb = require('oracledb');

const con = {
  user          : "system",
  password      : "oracle",
  connectString : "//localhost/orcl"
};

router.get('/', function(req, res) {
  res.render('index')
})

/* GET home page. */
router.get('/users', function(req, res, next) {
  oracledb.getConnection(con)
  .then(dados => {
    dados.execute("Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users")
      .then(dados => {res.render('users', {users: dados}); console.log(dados)})
      .catch(erro => {res.status(500).render('error', {error: erro})})
  })
  .catch(erro => {res.status(500).render('error', {error: erro})})
});


router.get('/privs', function(req, res, next) {
  var user = req.query.user
  
  if(user) {
    oracledb.getConnection(con)
    .then(dados => {
      var query = "Select PRIVILEGE from dba_sys_privs Where GRANTEE = '" + user + "'"
      
      dados.execute(query)
        .then(dados => {res.render('privs', {privs: dados, username: user}); console.log(dados)})
        .catch(erro => {res.status(500).render('error', {error: erro})})
    })
    .catch(erro => {res.status(500).render('error', {error: erro})})
  }
  else {res.render('error', {error: "Tem que ser de um utilizador em específico"})}
});

router.get('/roles', function(req, res){
  res.render('error', {error: "Ainda não está feito ehehehhe :o :o Chupaaa eheh .|."})
})

router.get('/cpu', function(req, res){
  res.render('error', {error: "Ainda não está feito ehehehhe :o :o Chupaaa eheh .|."})
})

router.get('/memoria', function(req, res){
  res.render('error', {error: "Ainda não está feito ehehehhe :o :o Chupaaa eheh .|."})
})

module.exports = router;
