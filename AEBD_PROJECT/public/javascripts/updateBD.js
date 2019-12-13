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
    c.execute('SELECT ts.tablespace_name, TRUNC("SIZE(MB)", 2) "Size", TRUNC(fr."FREE(MB)", 2) "Free"'
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
                                + 'AND fr.tablespace_name = ts.tablespace_name (+) ')
        .then(dados => {
                for(d in dados){
                    var update = "UPDATE BaseDados SET TOTAL_SIZE = "  + d[1] + " , FREE_SIZE = " + d[2] +", timestamp = CURRENT_TIMESTAMP WHERE NAME_TS = " + d[0] 
                    connection.execute(update)
                            .then(console.log("TABLESPACES ATUALIZADAS COM SUCESSO!"))
                            .catch(erro => {
                                    var insert = "INSERT INTO BaseDados (id_bd, NAME, PLATFORM, timestamp) VALUES (" + d[0] + " , '" + d[1] + "' , '" + d[2] + "', CURRENT_TIMESTAMP)"
                            })
                }
        })
        .cacth(erro => console.log("Erro no SELECT das TableSpaces: " + erro ))
}

function updateDataFiles(c){
dados = c.execute("SELECT Substr(df.file_name,1,20) NAME_DF, " +
                    "Substr(df.tablespace_name,1,40) NAME_TB, " +
                    "Round(df.bytes/1024/1024,0) FILE_SIZE, " +
                    "decode(e.used_bytes,NULL,0,Round(e.used_bytes/1024/1024,0)) USED_SIZE, " +
                    "decode(f.free_bytes,NULL,0,Round(f.free_bytes/1024/1024,0)) FREE_SIZE, " +
                    "c.CURRENT_TIMESTAMP TIMESTAMP, " +
                    "d.CURRENT_TIMESTAMP TIMESTAMP_FK " +
                    " FROM DBA_DATA_FILES DF, " +
                    " (SELECT file_id, " +
                    " Sum(Decode(bytes,NULL,0,bytes)) used_bytes " +
                    " FROM dba_extents " +
                    " GROUP by file_id) E, " +
                    " (SELECT Max(bytes) free_bytes, file_id " +
                    " FROM dba_free_space " +
                    " GROUP BY file_id) f, " +
                    " (SELECT CURRENT_TIMESTAMP FROM dual) c, " +
                    " (SELECT CURRENT_TIMESTAMP FROM dual) d " +
                    " WHERE e.file_id (+) = df.file_id " +
                    " AND df.file_id = f.file_id (+) " +
                    " ORDER BY df.tablespace_name,df.file_name");
    
                    

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

function updateSessions(c){
    c.execute("select SID, USER# USER_ID, USERNAME, SERIAL# SERIAL, c.CURRENT_TIMESTAMP TIMESTAMP" +
                " from v$session, (SELECT CURRENT_TIMESTAMP FROM dual) c " + 
                "WHERE USERNAME IS NOT NULL" +
                " order by 1" )
        .then(dados => {
                for(d in dados){

                }
        })
        .catch(erro => console.log("UPDATE SESSIONS " +erro))
}

function updateBD(){
    oracledb.getConnection(con)
            .then(connection => {
                // database
                try{
                    updateTableBD(connection)
                    updateCPU(connection)
                    updateMemory(connection)
                    await updateTableSpaces(connection)
                    updateDataFiles(connection)
                    await updateUsers(connection)
                    updateSessions(connection)
                    await updateRoles(connection)
                    updateUsersRoles(connection)
                    await updatePrivileges(connection)
                    updateUsersPrivileges(connection)

                }
                catch(erro){
                    console.log('ERRO: ' + erro)
                }
                
            })
            .catch(erro => {
                console.log('ERRO NA CONECÇÃO À BD AO FAZER UPDATE: ' + erro)
            })
}