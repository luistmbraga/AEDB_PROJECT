const oracledb = require('oracledb');

const con = {
  user          : "system",
  password      : "oracle",
  connectString : "//localhost/orcl"
};

function updateBD(){
    oracledb.getConnection(con)
            .then(connection => {
                // database
                connection.execute("Select ")
            })
            .catch(erro => {
                console.log('ERRO NA CONECÇÃO À BD AO FAZER UPDATE: ' + erro)
            })
}