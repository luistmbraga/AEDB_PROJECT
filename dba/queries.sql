Alter DataBase DataFile 'u01apporacleoradataorcl12orclaebd_tables_01.dbf'
Resize 500M;

ALTER USER LUIS98 ACCOUNT LOCK;

Select username, LAST_LOGIN, ACCOUNT_STATUS from dba_users

Select GRANTEE, PRIVILEGE from dba_sys_privs;

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


select tablespace_name
       , count(*) as no_of_data_files
       , sum(maxblocks) as max_size
from dba_data_files
group by tablespace_name;
-- Nº de sessões

select count(*) as num_sessions from v_$session where type='USER';

select * from V$DATAFILE;