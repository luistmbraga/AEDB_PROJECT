Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users;

Select GRANTEE, PRIVILEGE from dba_sys_privs;

-----------------------------------------------
-------------- Para insert/update ----------------------

-- database (tem que se ver melhor)
SELECT DBID, NAME, PLATFORM_NAME  FROM V$DATABASE;

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
   ts.tablespace_name,
   TRUNC("SIZE(MB)", 2) "Size",
   TRUNC(fr."FREE(MB)", 2) "Free"
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
AND fr.tablespace_name = ts.tablespace_name (+);

SELECT * FROM dba_tablespaces;
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
            
SELECT * FROM DBA_DATA_FILES;

SELECT Substr(df.file_name,1,20) NAME_DF,
 Substr(df.tablespace_name,1,40) NAME_TB,
 Round(df.bytes/1024/1024,0) FILE_SIZE,
 decode(e.used_bytes,NULL,0,Round(e.used_bytes/1024/1024,0)) USED_SIZE,
 decode(f.free_bytes,NULL,0,Round(f.free_bytes/1024/1024,0)) FREE_SIZE,
 c.CURRENT_TIMESTAMP TIMESTAMP,
 d.CURRENT_TIMESTAMP TIMESTAMP_FK
 FROM DBA_DATA_FILES DF,
 (SELECT file_id,
 Sum(Decode(bytes,NULL,0,bytes)) used_bytes
 FROM dba_extents 
 GROUP by file_id) E, 
 (SELECT Max(bytes) free_bytes, file_id 
 FROM dba_free_space
 GROUP BY file_id) f, 
 (SELECT CURRENT_TIMESTAMP FROM dual) c,
 (SELECT CURRENT_TIMESTAMP FROM dual) d 
 WHERE e.file_id (+) = df.file_id 
 AND df.file_id = f.file_id (+) 
 ORDER BY df.tablespace_name,df.file_name;

-- cpu

-- memoria


-----------------------------------------------

select * from dba_roles; 

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

SELECT USERNAME, SUM(CPU_USAGE) AS CPU_USAGE FROM
(
SELECT se.username, ROUND (value/100) AS CPU_USAGE
FROM v$session se, v$sesstat ss, v$statname st
WHERE ss.statistic# = st.statistic#
   AND name LIKE  '%CPU used by this session%'
   AND se.sid = ss.SID
   AND se.username IS NOT NULL
  ORDER BY value DESC
)
GROUP BY USERNAME;