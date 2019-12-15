const oracledb = require('oracledb');

const dbaCon12c= {
    user          : "system",
    password      : "oracle",
    connectString : "//localhost/orcl12c"
  };

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

var dbaConnection12c;
oracledb.getConnection(dbaCon12c)
        .then(c => dbaConnection12c = c)
        .catch(erro => console.log("ERROR IN DBA CONNECTION (12c): " + error))

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
                    var update = "UPDATE BASEDADOS SET NAME = :0, PLATFORM = :1, timestamp = CURRENT_TIMESTAMP WHERE id_bd = :2"
                    groupConnection.execute(update, dado, {autoCommit : true})
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO BASEDADOS (NAME, PLATFORM, timestamp, id_bd) VALUES (:0, :1, CURRENT_TIMESTAMP, :2)"
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
    
        return Promise.resolve('Success');
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
                                                .catch(erro => console.log("ERRO NO INSERT DATAFILES (TS :  " + dado[1] + " )   : " + erro))
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
                            .then(d => { //console.log("Rows affected: " + d.rowsAffected)
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO USERS (USERNAME, LAST_LOGIN, ATIVO, TIMESTAMP, NAME_TS) VALUES (:0, :1, :2, CURRENT_TIMESTAMP, :3)"
                                    groupConnection.execute(insert, dado, {autoCommit : true})
                                                .catch(erro => console.log("ERRO NO INSERT DOS USERS (TS : " + dado[3] +   ")   : " + erro))
                                }
                            })
                            .catch(erro => console.log("ERRO NO UPDATE DOS USERS : " + erro))
            })
        })
        .catch(erro => console.log("ERRO NO SELECT DOS USERS: " + erro))

        return Promise.resolve('Success');

}

function updateRoles(){
    dbaConnection.execute("SELECT ROLE FROM dba_roles")
                .then(dados => {
                    dados.rows.forEach((dado) => {
                        var update = "UPDATE ROLES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE NAME = :0";
                        groupConnection.execute(update, dado, {autoCommit:true})
                            .then(d => {
                                if(d.rowsAffected == 0){
                                    var insert = "INSERT INTO ROLES (NAME, TIMESTAMP) VALUES (:0, CURRENT_TIMESTAMP)"
                                    groupConnection.execute(insert, dado, {autoCommit : true})
                                }
                            })
                    })
                })
    return Promise.resolve('Success');
}


function updatePrivileges(){
    dbaConnection.execute("select distinct PRIVILEGE from dba_sys_privs")
            .then(dados => {
                dados.rows.forEach((dado) => {
                    var update = "UPDATE PRIVILEGES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE NAME = :0";
                    groupConnection.execute(update, dado, {autoCommit:true})
                    .then(d => {
                        if(d.rowsAffected == 0){
                            var insert = "INSERT INTO PRIVILEGES (NAME, TIMESTAMP) VALUES (:0,  CURRENT_TIMESTAMP)"
                            groupConnection.execute(insert, dado, {autoCommit:true})
                        }
                    })
                })
            })
    return Promise.resolve('Success');
}

function updateUsersPrivileges(){
    dbaConnection.execute("select PRIVILEGE, GRANTEE from dba_sys_privs")
            .then(dados => {
                dados.rows.forEach((dado) => {
                    var update = "UPDATE USER_PRIVILEGES SET TIMESTAMP = CURRENT_TIMESTAMP WHERE PRIV_NAME = :0 AND USERS_USERNAME = :1";
                    groupConnection.execute(update, dado, {autoCommit:true})
                    .then(d => {
                        if(d.rowsAffected == 0){
                            groupConnection.execute("Select count(*) From USERS Where Username = :0", [dado[1]])
                                           .then(result => {
                                               if(result.rows[0][0] > 0){
                                                    var insert = "INSERT INTO USER_PRIVILEGES (PRIV_NAME, USERS_USERNAME, TIMESTAMP) VALUES (:0, :1,  CURRENT_TIMESTAMP)"
                                                    c.execute(insert, dado, {autoCommit:true})
                                               }
                                           })
                        }
                    })
                })
            })
}


function updateUsersRoles(){
    dbaConnection.execute("select GRANTEE, GRANTED_ROLE from dba_role_privs")
    .then(dados => {
       dados.rows.forEach((dado) =>{
        var update = "UPDATE USERROLES SET timestamp = CURRENT_TIMESTAMP WHERE NAME_USER = :0 AND ROLES_NAME = :1"
        groupConnection.execute(update, dado, {autoCommit : true})
                .then(d => {
                    if(d.rowsAffected == 0){
                        groupConnection.execute("Select count(*) From ROLES Where NAME = :0", [dado[1]])
                            .then(result1 => {
                                groupConnection.execute("Select count(*) From USERS Where USERNAME = :0", [dado[0]])
                                    .then(result2 => {
                                        if(result1.rows[0][0] > 0 && result2.rows[0][0] > 0){
                                            var insert = "INSERT INTO USERROLES (NAME_USER, ROLES_NAME, timestamp) VALUES (:0, :1, CURRENT_TIMESTAMP)"
                                            groupConnection.execute(insert, dado, {autoCommit : true})
                                                           .catch(erro => console.log('ERRO NO INSERT DA TABLE DA USERROLES: ' + erro))
                                        }
                                    })
                            })
                    }
                })
       })

       
   })
     .catch(erro => console.log("ERRO NO SELECT DO USERROLES: " +  erro))
}

function updateCPU(){
    dbaConnection12c.execute("select value from SYS.V_$SYSMETRIC where METRIC_NAME IN ('Database CPU Time Ratio') and INTSIZE_CSEC =(select max(INTSIZE_CSEC) from SYS.V_$SYSMETRIC)")
                .then(dados => {
                    if(dados.rows.length > 0){
                        //console.log(dados)
                        //console.log(dados.rows[0][0])
                        var insert = "insert into cpu (ID_C,USAGE,TOTAL,TIMESTAMP) VALUES(2,:0,00,CURRENT_TIMESTAMP)"
                        groupConnection.execute(insert,dados.rows[0],{autoCommit : true})
                                        .catch(erro => console.log('ERRO NO INSERT DNA TABLE CPU: ' + erro ))
                    }

            })
                .catch(erro => console.log("ERRO NO SELECT DA TABLE CPU: " +  erro ))
}

function updateMemory(){
    dbaConnection.execute(" SELECT round(SUM(bytes/1024/1024)) FROM \"SYS\".\"V_$SGASTAT\" Where Name Like '%free memory%' union SELECT sum(value)/1024/1024  FROM v$sga")
                .then(dados => {
                    //console.log(dados.rows)
                    var insert = "insert into memory (ID_M,TOTAL,USAGE,TIMESTAMP) VALUES(1,:1,:0,CURRENT_TIMESTAMP)"
                    var result = []
                    result[0] = dados.rows[0][0]
                    result[1] = dados.rows[1][0]
                    //console.log(result) 
                    groupConnection.execute(insert,result,{autoCommit : true})
                                    .catch(erro => console.log('ERRO NO INSERT DA TABLE MEMORY: ' + erro ))
        })
                .catch(erro => console.log("ERRO NO SELECT DA TABLE MEMORY: " +  erro ))
}

function updateSessions(){
    dbaConnection.execute("select SID, PROGRAM, USERNAME " +
                " from v$session, (SELECT CURRENT_TIMESTAMP FROM dual) c " + 
                "WHERE USERNAME IS NOT NULL" +
                " order by 1" )
        .then(dados => {
                groupConnection.execute('TRUNCATE TABLE SESSIONS')
                               .then(d => {
                                    dados.rows.forEach((dado) =>{
                                        var insert = "INSERT INTO SESSIONS (id_ses, program, timestamp, users_username) VALUES (:0, :1, CURRENT_TIMESTAMP, :2)"
                                        groupConnection.execute(insert, dado, {autoCommit:true})
                                    })
                               })
                               .catch(erro => console.log("ERRO SESSIONS : " + erro))

        })
        .catch(erro => console.log("ERRO NO SELECT SESSIONS: " +erro))
}

async function updateBD(){
                console.log("A fazer update à BD...")
                try{
                    updateTableBD()
                    
                    updateCPU()
                    updateMemory()
                    await updateTableSpaces()
                        .then( async d => {
                            
                            updateDataFiles()
                            
                            await updateUsers()
                                        .then(async de =>{
                                            
                                            updateSessions()
                                            await updateRoles()
                                                .then(d => updateUsersRoles())
                                            await updatePrivileges()
                                                //.then(d => updateUsersPrivileges())
                                                
                                        })
                                
                        })
                }
                catch(erro){
                    console.log('ERRO: ' + erro)
                    console.log(erro.stack)
                }
}

setInterval(updateBD, 2000)
