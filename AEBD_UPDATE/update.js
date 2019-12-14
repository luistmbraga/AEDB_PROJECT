const oracledb = require('oracledb');

const dbaCon= {
  user          : "system",
  password      : "oracle",
  connectString : "//localhost/orcl"
};

const groupCon= {
    user          : "grupo06",
    password      : "oracle",
    connectString : "//localhost/orcl"
  };

var dbaConnection;
oracledb.getConnection(dbaCon)
        .then(c => dbaConnection = c)
        .catch(erro => console.log("ERROR IN DBA CONNECTION: " + error))
                            
var groupConnection;
oracledb.getConnection(groupCon)
        .then(c => groupConnection = c)
        .catch(error => console.log("ERROR IN GROUP CONNECTION: " + error))

function updateTableBD(){
    dbaConnection.execute("SELECT NAME, PLATFORM_NAME, DBID FROM V$DATABASE")
                .then(dados => {
                dados.rows.forEach((dado) =>{
                    var update = "UPDATE BaseDados SET NAME = :0, PLATFORM = :1, timestamp = CURRENT_TIMESTAMP WHERE id_bd = :2"
                    groupConnection.execute(update, dado, {autoCommit : true})
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO BaseDados (NAME, PLATFORM, timestamp, id_bd) VALUES (:0, :1, CURRENT_TIMESTAMP, :2)"
                                    groupConnection.execute(insert, dado,  { autoCommit: true })
                                                   .catch(erro => console.log('ERRO NO INSERT DA TABLE DA BASE DE DADOS: ' + erro ))
                                }
                            })
                            .catch(erro => console.log("ERRO NO UPDATE DA TABLE DA BD : " + erro))
                })

            })
                .catch(erro => console.log("ERRO NO SELECT DA DATABASE: " +  erro ))

}

function updateTableSpaces(){
    dbaConnection.execute('SELECT ts.tablespace_name, TRUNC("SIZE(MB)", 2) "Size", TRUNC(fr."FREE(MB)", 2) "Free" '
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
                dados.rows.forEach((dado) => {
                    var update = "UPDATE tablespaces SET TOTAL_SIZE = :0 , FREE_SIZE = :1, timestamp = CURRENT_TIMESTAMP WHERE NAME_TS = :2"
                    groupConnection.execute(update, [dado[1], dado[2], dado[0]], {autoCommit : true})
                            .then(d=> {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO tablespaces (NAME_TS, TOTAL_SIZE, FREE_SIZE, timestamp) VALUES (:0, :1, :2, CURRENT_TIMESTAMP)"
                                    groupConnection.execute(insert, dado, {autoCommit:true})
                                        .catch(erro => console.log("ERRO NO INSERT TABLESPACE: "+ dado + erro))
                                }
                            })
                            .catch(erro => console.log("ERRO NO UPDATE DA TABLESPACE: " + erro))
                });
        })
        .catch(erro => console.log("Erro no SELECT das TableSpaces: " + erro ))  

        return Promise.resolve('Hello');
}

function updateDataFiles(){
dbaConnection.execute("SELECT df.FILE_ID, " + 
                    "Substr(df.tablespace_name,1,40) NAME_TB, " +
                    "Substr(df.file_name,1,20) NAME_DF, " +
                    "Round(df.bytes/1024/1024,0) FILE_SIZE, " +
                    "decode(f.free_bytes,NULL,0,Round(f.free_bytes/1024/1024,0)) FREE_SIZE " + 
                    " FROM DBA_DATA_FILES DF, " +
                    " (SELECT file_id, " +
                    " Sum(Decode(bytes,NULL,0,bytes)) used_bytes " +
                    " FROM dba_extents " +
                    " GROUP by file_id) E, " +
                    " (SELECT Max(bytes) free_bytes, file_id " +
                    " FROM dba_free_space " +
                    " GROUP BY file_id) f " +
                    " WHERE e.file_id (+) = df.file_id " +
                    " AND df.file_id = f.file_id (+) ")
          .then(dados => {
              dados.rows.forEach((dado) =>{
                var update = "UPDATE datafiles SET NAME = :0, TOTAL_SIZE = :1, FREE_SIZE = :2, timestamp = CURRENT_TIMESTAMP, NAME_TS = :3 WHERE FILE_ID = :4"
                groupConnection.execute(update, [dado[2], dado[3], dado[4], dado[1], dado[0]], {autoCommit:true})
                        .then(d => {
                            if(d.rowsAffected == 0){
                                var insert = "INSERT INTO datafiles (file_id, name_ts, name, total_size, free_size, timestamp) VALUES (:0, :1, :2, :3, :4, CURRENT_TIMESTAMP)"
                                groupConnection.execute(insert, dado, {autoCommit:true})
                                                .catch(erro => console.log("ERRO NO INSERT DATAFILES: " + erro))
                            }
                        })
                        .catch(erro => console.log('ERRO NO UPDATE DOS DATAFILES: ' + erro ))
              })
          })
          .catch(erro => console.log("ERRO NO SELECT dos DATAFILES: " + erro))
}


function updateUsers(c){
    dbaConnection.execute("Select username, last_login, account_status, DEFAULT_TABLESPACE From dba_users")
        .then(dados => {
            dados.rows.forEach((dado) => {
                var update = "UPDATE USERS SET LAST_LOGIN = :0, ATIVO = :1, timestamp = CURRENT_TIMESTAMP, NAME_TS = :2 WHERE USERNAME = :3"
                groupConnection.execute(update, [dado[1], dado[2], dado[3], dado[0]], {autoCommit:true})
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO USERS (USERNAME, LAST_LOGIN, ATIVO, TIMESTAMP, NAME_TS) VALUES (:0, :1, :2, CURRENT_TIMESTAMP, :3)"
                                    groupConnection.execute(insert, dado, {autoCommit : true})
                                                .catch(erro => console.log("ERRO NO INSERT DOS USERS : " + erro))
                                }
                            })
                            .catch(erro => console.log("ERRO NO UPDATE DOS USERS : " + erro))
            })
        })
        .catch(erro => console.log("ERRO NO SELECT DOS USERS: " + erro))
}

function updateRoles(){
    dbaConnection.execute("SELECT ROLE FROM dba_roles")
                .then(dados => {
                    dados.rows.forEach((dado) => {
                        var update = "UPDATE ROLES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE NAME = :0";
                        groupConnection.execute(update, dado, {autoCommit:true})
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO ROLES (NAME, TIMESTAMP) VALUES (:0 ,  CURRENT_TIMESTAMP)"
                                    groupConnection.execute(insert, dado, {autoCommit : true})
                                }
                            })
                    })
                })

}


function updatePrivileges(c){
    dados = c.execute("select distinct PRIVILEGE from dba_sys_privs")
    for(d in dados){
        var update = "UPDATE PRIVILEGES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE NAME = '" + d[0] + "'";
            c.execute(update)
            .then()
            .catch(erro => {
                var insert = "INSERT INTO PRIVILEGES (NAME, TIMESTAMP) VALUES ('" + d[0] + "' ,  CURRENT_TIMESTAMP)"
                c.execute(insert)
            })
    }
}

function updateUsersPrivileges(c){
    dados = c.execute("select GRANTEE, PRIVILEGE from dba_sys_privs"); 
    for(d in dados){
        var update = "UPDATE USERS_PRIVILEGES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE USERS_USERNAME = '" + d[0] + "'";
            c.execute(update)
            .then()
            .catch(erro => {
                var insert = "INSERT INTO USERS_PRIVILEGES (USERS_USERNAME, PRIV_NAME, TIMESTAMP) VALUES ('" + d[0] + "', '" + d[1] +"' ,  CURRENT_TIMESTAMP)"
                c.execute(insert)
            })
    }
}

// fazer
function updateUsersRoles(c){
    c.execute("select GRANTEE, GRANTED_ROLE from dba_role_privs")
    .then(dados => {
       for(d in dados){
           var update = "UPDATE USERROLES SET timestamp = CURRENT_TIMESTAMP WHERE NAME_USER = '" + d[0] +"' AND ROLES_NAME = '" + d[1] + "'"
           c.execute(update)
                   .then()
                   .catch(erro => {
                           var insert = "INSERT INTO USERROLES (NAME_USER, ROLES_NAME, timestamp) VALUES ('" + d[0] + "' , '" + d[1] + "' , CURRENT_TIMESTAMP)"
                           c.execute(insert)
                            .then()
                            .catch(erro => console.log('ERRO NO INSERT DA TABLE DA USERROLES: ' + erro))
                   })
       }
   })
     .catch(erro => console.log("ERRO NO SELECT DO USERROLES: " +  erro))
}

function updateCPU(c){
    /*
                select
            metric_name
            from
            v$metricname
            where
            metric_id = 2108
            and
            group_name = 'System Metrics Long Duration';

            METRIC_NAME
            --------------------
            Database CPU Time Ratio

            select
            metric_name,
            value
            from
            SYS.V_$SYSMETRIC
            where
            METRIC_NAME IN
                ('Database CPU Time Ratio')
            and
            INTSIZE_CSEC =
            (select max(INTSIZE_CSEC) from SYS.V_$SYSMETRIC);
    */
}

function updateMemory(c){
    /*
    */
}

function updateSessions(c){
    c.execute("select SID, USERNAME, PROGRAM" +
                " from v$session, (SELECT CURRENT_TIMESTAMP FROM dual) c " + 
                "WHERE USERNAME IS NOT NULL" +
                " order by 1" )
        .then(dados => {
                //c.execute('DELETE FROM SESSIONS;')
                for(d in dados){
                    var update = "INSERT INTO SESSIONS (USERNAME) USERNAME = '" + d[1] + "', PROGRAM = "
                    c.execute(update)
                }
        })
        .catch(erro => console.log("ERRO NO SELECT SESSIONS: " +erro))
}

function updateBD(){
                // atualizar as tabelas todas
                try{
                    updateTableBD()
                    
                    //updateCPU(connection)
                    //updateMemory(connection)
                    updateTableSpaces()
                        .then( d => {
                            console.log("UPDATE TABLESPACES REALIZADO")
                            
                            updateDataFiles()
                            
                            updateUsers()
                            /*
                                .then(function(){ console.log("CORREU TUDO BEM!")
                                    /*
                                    updateSessions(connection)
                                    updateRoles(connection)
                                        .then(d => updateUsersRoles(connection))
                                    updatePrivileges(connection)
                                        .then(d => updateUsersPrivileges(connection))
                                        
                                })*/
                                
                        })
                        .catch(erro => console.log( "ERRO NO TABLESPACES: " + erro))
                    
                }
                catch(erro){
                    console.log('ERRO: ' + erro)
                    console.log(erro.stack)
                }
}


setInterval(updateBD, 2000)