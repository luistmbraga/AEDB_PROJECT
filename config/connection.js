const oracledb = require('oracledb');


module.exports.getConnection = async function(){
    var db = await oracledb.getConnection({user: "system", password: "oracle", connectString: "//localhost/orcl"})
                        .then(console.log("Connection realizada com sucesso!"))
                        .catch(erro => console.log(erro));
    return db;
}

module.exports.closeConnection = async function(db){
    await db.close();
}
