var express = require('express');
var router = express.Router();
const oracledb = require('oracledb');

const con = {
  user          : "system",
  password      : "oracle",
  connectString : "//localhost/orcl"
};


/* GET home page. */
router.get('/users', function(req, res, next) {
  oracledb.getConnection(con)
  .then(dados => {
    dados.execute("Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users")
      .then(dados => {res.render('users', {users: dados}); console.log(dados)})
      .catch(erro => {res.status(500).jsonp(erro)})
  })
  .catch(erro => {res.status(500).jsonp(erro)})
});

router.get('/privs', function(req, res, next) {
  oracledb.getConnection(con)
  .then(dados => {
    dados.execute("Select GRANTEE, PRIVILEGE from dba_sys_privs")
      .then(dados => {res.render('privs', {privs: dados}); console.log(dados)})
      .catch(erro => {res.status(500).jsonp(erro)})
  })
  .catch(erro => {res.status(500).jsonp(erro)})
});



module.exports = router;
