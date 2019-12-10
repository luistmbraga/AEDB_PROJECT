const oracledb = require('oracledb');

const con = {
  user          : "grupo06",
  password      : "oracle",
  connectString : "//localhost/orcl"
};

function updateTableBD(c){
    dados = c.execute("SELECT DBID, NAME, PLATFORM_NAME FROM V$DATABASE");
    for(d in dados){
        var update = "UPDATE BaseDados SET NAME = '" + d[1] + "', PLATFORM = '"  + d[2] + "', timestamp = CURRENT_TIMESTAMP WHERE id_bd = " + d[0] 
        connection.execute(update)
                  .then()
                  .catch(erro => {
                        var insert = "INSERT INTO BaseDados (id_bd, NAME, PLATFORM, timestamp) VALUES (" + d[0] + " , '" + d[1] + "' , '" + d[2] + "', CURRENT_TIMESTAMP)"
                  })
    }
}

function updateTableSpaces(c){
    dados = connection.execute('SELECT ts.tablespace_name, TRUNC("SIZE(MB)", 2) "Size", TRUNC(fr."FREE(MB)", 2) "Free"'
                                + 'FROM '   
                                + '(SELECT tablespace_name, '
                                + 'SUM (bytes) / (1024 * 1024) "FREE(MB)" '
                                + 'FROM dba_free_space '
                                + 'GROUP BY tablespace_name) fr, '
                                + '(SELECT tablespace_name, SUM(bytes) / (1024 * 1024) "SIZE(MB)", COUNT(*) '
                                + '"File Count", SUM(maxbytes) / (1024 * 1024) "MAX_EXT" '
                                + 'FROM dba_data_files '
                                + 'GROUP BY tablespace_name) df, '
                                + '(SELECT tablespace_name '
                                + 'FROM dba_tablespaces) ts '
                                + 'WHERE fr.tablespace_name = df.tablespace_name (+) '
                                + 'AND fr.tablespace_name = ts.tablespace_name (+) ');
    for(d in dados){
        var update = "UPDATE BaseDados SET TOTAL_SIZE = "  + d[1] + " , FREE_SIZE = " + d[2] +", timestamp = CURRENT_TIMESTAMP WHERE NAME_TS = " + d[0] 
        connection.execute(update)
                  .then()
                  .catch(erro => {
                        var insert = "INSERT INTO BaseDados (id_bd, NAME, PLATFORM, timestamp) VALUES (" + d[0] + " , '" + d[1] + "' , '" + d[2] + "', CURRENT_TIMESTAMP)"
                  })
    }
}

function updateDataFiles(c){
    
}

function updateRoles(c){

}

function updatePrivileges(c){

}

function updateUsers(c){

}

function updateUsersPrivileges(c){

}

function updateUsersRoles(c){
    
}

function updateCPU(c){

}

function updateMemory(c){

}

function updateBD(){
    oracledb.getConnection(con)
            .then(connection => {
                // database
                try{
                    updateTableBD(connection)
                    updateTableSpaces(connection)
                    updateDataFiles(connection)
                    updateRoles(connection)
                    updatePrivileges(connection)
                    updateUsers(connection)
                    updateUsersPrivileges(connection)
                    updateUsersRoles(connection)
                    updateCPU(connection)
                    updateMemory(connection)
                }
                catch(erro){
                    console.log('ERRO: ' + erro)
                }
                
            })
            .catch(erro => {
                console.log('ERRO NA CONECÇÃO À BD AO FAZER UPDATE: ' + erro)
            })
}