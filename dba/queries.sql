Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users;

Select GRANTEE, PRIVILEGE from dba_sys_privs;

-----------------------------------------------
-------------- Para insert/update ----------------------

-- database (tem que se ver melhor)
SELECT DBID, NAME, PLATAFORM_NAME  FROM V$DATABASE;

-- users (faltam as horas no sysdate)
Select user_id, username, last_login, account_status, sysdate From dba_users;
select * from dba_users where username='SYS';

-- privileges
Select GRANTEE, PRIVILEGE, sysdate from dba_sys_privs;
SELECT GRANTEE, OWNER, GRANTOR, PRIVILEGE, GRANTABLE
FROM DBA_TAB_PRIVS
ORDER BY OWNER ASC;


--roles
select
   *
from
   dba_role_privs;

-- tablespaces
select * from dba_tablespaces;

SELECT 
   ts.tablespace_name, "File Count",
   TRUNC("SIZE(MB)", 2) "Size",
   TRUNC(fr."FREE(MB)", 2) "Free",
   TRUNC("SIZE(MB)" - "FREE(MB)", 2) "Used(MB)",
   df."MAX_EXT" "Max Ext(MB)",
   (fr."FREE(MB)" / df."SIZE(MB)") * 100 "% Free"
FROM 
   (SELECT tablespace_name,
   SUM (bytes) / (1024 * 1024) "FREE(MB)"
   FROM dba_free_space
    GROUP BY tablespace_name) fr,
(SELECT tablespace_name, SUM(bytes) / (1024 * 1024) "SIZE(MB)", COUNT(*)
"File Count", SUM(maxbytes) / (1024 * 1024) "MAX_EXT"
FROM dba_data_files
GROUP BY tablespace_name) df,
(SELECT tablespace_name
FROM dba_tablespaces) ts
WHERE fr.tablespace_name = df.tablespace_name (+)
AND fr.tablespace_name = ts.tablespace_name (+)
ORDER BY "% Free" desc;

select df.tablespace_name, sum(df.maxblocks) as max_size, sysdate
    from dba_tablespaces ts, dba_data_files df
    where ts.tablespace_name = ts.tablespace_name
    group by df.tablespace_name;

-- Para depois apresentamos o n� de datafiles de cada tablespace, mas teremos que ir � nossa BD
select count(*) as no_of_data_files from dba_data_files group by tablespace_name;

--datafiles (se calhar deviamos disitinguir as tempor�rias das normais)
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
-- N� de sess�es

select count(*) as num_sessions from v_$session where type='USER';

select * from V$DATAFILE;

