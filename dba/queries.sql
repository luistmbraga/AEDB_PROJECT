Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users;

Select GRANTEE, PRIVILEGE from dba_sys_privs;

-----------------------------------------------
-------------- Para insert/update ----------------------

-- database (tem que se ver melhor)
SELECT DBID, NAME, PLATAFORM_NAME  FROM V$DATABASE;

-- users (faltam as horas no sysdate)
Select user_id, username, last_login, account_status, sysdate From dba_users;

-- privileges
Select GRANTEE, PRIVILEGE, sysdate from dba_sys_privs;

--roles
select role, role_id from dba_roles;

-- tablespaces
select df.tablespace_name, sum(df.maxblocks) as max_size, sysdate
    from dba_tablespaces ts, dba_data_files df
    where ts.tablespace_name = ts.tablespace_name
    group by df.tablespace_name;

-- Para depois apresentamos o nº de datafiles de cada tablespace, mas teremos que ir à nossa BD
select count(*) as no_of_data_files from dba_data_files group by tablespace_name;

--datafiles (se calhar deviamos disitinguir as temporárias das normais)
SELECT FILE_NAME, BYTES, TABLESPACE_NAME  FROM DBA_DATA_FILES 
        UNION 
            SELECT FILE_NAME, BYTES, TABLESPACE_NAME  FROM DBA_TEMP_FILES;

-- cpu

-- memoria


-----------------------------------------------

select * from dba_roles where Role_id > 2147483600;

select * from dba_role_privs;



select username, machine, to_char(logon_time,'HH:MM:SS')from v$session;

select * from DBA_TABLESPACES;

select * from DBA_DATAFILES;

CREATE USER BINO IDENTIFIED BY admin;

Select TABLE_NAME From DBA WHERE OWNER='sys';

select sysdate,systimestamp from dual;


SELECT * FROM V$DATABASE;

SELECT * FROM V_$SESSION;

SELECT * FROM DBA_CPU_USAGE_STATISTICS ;

Select * From DBA_TABLESPACES;


select tablespace_name
       , count(*) as no_of_data_files
       , sum(maxblocks) as max_size
from dba_data_files
group by tablespace_name;
-- Nº de sessões

select count(*) as num_sessions from v_$session where type='USER';

select * from V$DATAFILE;

