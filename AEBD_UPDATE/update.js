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
                console.log(dados.rows)
                for(dado in dados.rows){
                    var update = "UPDATE BaseDados SET NAME = :0, PLATFORM = :1, timestamp = CURRENT_TIMESTAMP() WHERE id_bd = :2" 
                    groupConnection.execute(update, dados.rows[dado])
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    console.log("A TENTAR FAZER INSERT NA TABLE DA BASE DE DADOS")
                                    var insert = "INSERT INTO BaseDados (NAME, PLATFORM, timestamp, id_bd) VALUES (:0, :1, CURRENT_TIMESTAMP, :2)"
                                    groupConnection.execute(insert, dados.rows[dado],  { autoCommit: true })
                                                   .catch(erro => console.log('ERRO NO INSERT DA TABLE DA BASE DE DADOS: ' + erro ))
                                }
                            })
                            .catch(erro => console.log("ERRO NO UPDATE DA TABLE DA BD : " + erro))
                }
            })
                .catch(erro => console.log("ERRO NO SELECT DA DATABASE: " +  erro ))

}

function updateTableSpaces(c){
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
                for(d in dados){
                    var update = "UPDATE BaseDados SET TOTAL_SIZE = "  + d[1] + " , FREE_SIZE = " + d[2] +", timestamp = CURRENT_TIMESTAMP WHERE NAME_TS = " + d[0] 
                    c.execute(update)
                            .then(console.log("TABLESPACES ATUALIZADAS COM SUCESSO!"))
                            .catch(erro => {
                                    var insert = "INSERT INTO TableSpaces (NAME_TS, TOTAL_SIZE, FREE_SIZE, timestamp) VALUES ('" + d[0] + "' , " + d[1] + ", " + d[2] + ", CURRENT_TIMESTAMP)"
                                    c.execute(insert)
                                        .then(console.log("INSERT NO TABLESPACE COM SUCESSO: " + d[0] ))
                                        .catch(erro => console.log("ERRO NO INSERT TABLESPACE: " + erro))
                            })
                }
        })
        .cacth(erro => console.log("Erro no SELECT das TableSpaces: " + erro ))
}

function updateDataFiles(c){
dados = c.execute("SELECT Substr(df.file_name,1,20) NAME_DF, " +
                    "Substr(df.tablespace_name,1,40) NAME_TB, " +
                    "Round(df.bytes/1024/1024,0) FILE_SIZE, " +
                    "decode(f.free_bytes,NULL,0,Round(f.free_bytes/1024/1024,0)) FREE_SIZE, " +
                    "df.FILE_ID " + 
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
                    " ORDER BY df.tablespace_name,df.file_name")
          .then(dados => {
              for(d in dados){
                var update = "UPDATE TABLESPACES SET NAME = '" + d[0] + "', TOTAL_SIZE = " + d[2] + ", FREE_SIZE = " 
                                    + d[3] + ", timestamp = CURRENT_TIMESTAMP, NAME_TS = '" + d[1] + "', FILE_ID = " + d[4]
                    c.execute(update)
                     .then()
                     .catch(erro => console.log('ERRO NO UPDATE DOS DATAFILES : ' + erro ))
              }
          })
          .catch(erro => console.log("ERRO NO SELECT dos DATAFILES: " + erro))
    

}


function updateUsers(c){
    c.execute("Select username, last_login, account_status, DEFAULT_TABLESPACE From dba_users")
        .then(dados => {
            for(d in dados){
                var update = "UPDATE USERS SET LAST_LOGIN = '" + d[1] + "', ATIVO = '" + d[2] 
                                + "', timestamp = CURRENT_TIMESTAMP, NAME_TS = '" + d[3] + "' WHERE USERNAME = '" + d[0] +"'"

                c.execute(update)
                 .then()
                 .cacth(erro =>{
                    var insert = "INSERT INTO USERS (USERNAME, LAST_LOGIN, ATIVO, TIMESTAMP, NAME_TS)" + 
                                " VALUES ('"+ d[0] +"', '" + d[1] + "', '" + d[2] + "', CURRENT_TIMESTAMP, '" + d[3] + "')"
                 })
            }
        })
        .catch(erro => console.log("ERRO NO SELECT DOS USERS: " + erro))
}

function updateRoles(c){
    dados = c.execute("SELECT ROLE FROM dba_roles");
    for(d in dados){
        var update = "UPDATE ROLES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE NAME = '" + d[0] + "'";
        c.execute(update)
            .then()
            .catch(erro => {
                var insert = "INSERT INTO ROLES (NAME, TIMESTAMP) VALUES ('" + d[0] + "' ,  CURRENT_TIMESTAMP)"
                c.execute(insert)
            })
    }
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
    dados = c.execute("select GRANTEE, PRIVILEGE from dba_sys_privs"); PRIV_NAME
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
                    /*
                    updateCPU(connection)
                    updateMemory(connection)
                    updateTableSpaces(connection)
                        .then(d => {
                            updateDataFiles(connection)
                            updateUsers(connection)
                                .then(d =>{
                                    updateSessions(connection)
                                    updateRoles(connection)
                                        .then(d => updateUsersRoles(connection))
                                    updatePrivileges(connection)
                                        .then(d => updateUsersPrivileges(connection))
                              })
                        })
                    */
                }
                catch(erro){
                    console.log('ERRO: ' + erro)
                }
}


setInterval(updateBD, 2000)