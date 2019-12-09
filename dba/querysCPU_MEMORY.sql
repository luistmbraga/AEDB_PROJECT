select * from v$sql_monitor;  

select * from gv$sql_monitor; 

select * from v$osstat; 


select select value /( value+ value) from v$osstat where ;

select s.value/(s.value+b.value_idle) from v$osstat s, (
    select value as value_idle from v$sstat where stat_name = 'IDLE_TIME';
) where s.stat_name = 'BUSY_TIME'; 



select STAT_NAME,to_char(VALUE) as VALUE  ,COMMENTS from v$osstat where stat_name  IN ('NUM_CPUS','NUM_CPU_CORES','NUM_CPU_SOCKETS')
union
select STAT_NAME,VALUE/1024/1024/1024 || ' GB'  ,COMMENTS from v$osstat where stat_name  IN ('PHYSICAL_MEMORY_BYTES')


select * from V$DATABASE;
SELECT *  FROM DBA_CPU_USAGE_STATISTICS ;



select * from DBA_HIST_SYSMETRIC_SUMMARY;

// CURRENT UTILIZATION 
select sum(cpu_usage_per_cent) from
(
select username,sid,
       round((cpu_usage/(
                        select sum(value) total_cpu_usage
                          from gv$sesstat t
                         inner join gv$session  s on ( t.sid = s.sid )
                         inner join gv$statname n on ( t.statistic# = n.statistic# )
                         where n.name like '%CPU used by this session%'
                           and nvl(s.sql_exec_start, s.prev_exec_start) >= sysdate-1/24
                        ))*100,2) cpu_usage_per_cent,
       module_info,client_info 
  from
(
select nvl(s.username,'Oracle Internal Proc.') username,s.sid,t.value cpu_usage, nvl(s.module, s.program) module_info, decode(s.osuser,'oracle', s.client_info, s.osuser) client_info
  from gv$sesstat t
       inner join gv$session  s on ( t.sid = s.sid )
       inner join gv$statname n on ( t.statistic# = n.statistic# )
 where n.name like '%CPU used by this session%'
   and nvl(s.sql_exec_start, s.prev_exec_start) >= sysdate-1/24
) s1
)
order by cpu_usage_per_cent desc;

SELECT TO_CHAR(SAMPLE_TIME, 'HH24:MI ') AS SAMPLE_TIME,
       ROUND(OTHER / 60, 3) AS OTHER,
       ROUND(CLUST / 60, 3) AS CLUST,
       ROUND(QUEUEING / 60, 3) AS QUEUEING,
       ROUND(NETWORK / 60, 3) AS NETWORK,
       ROUND(ADMINISTRATIVE / 60, 3) AS ADMINISTRATIVE,
       ROUND(CONFIGURATION / 60, 3) AS CONFIGURATION,
       ROUND(COMMIT / 60, 3) AS COMMIT,
       ROUND(APPLICATION / 60, 3) AS APPLICATION,
       ROUND(CONCURRENCY / 60, 3) AS CONCURRENCY,
       ROUND(SIO / 60, 3) AS SYSTEM_IO,
       ROUND(UIO / 60, 3) AS USER_IO,
       ROUND(SCHEDULER / 60, 3) AS SCHEDULER,
       ROUND(CPU / 60, 3) AS CPU,
       ROUND(BCPU / 60, 3) AS BACKGROUND_CPU
  FROM (SELECT TRUNC(SAMPLE_TIME, 'MI') AS SAMPLE_TIME,
               DECODE(SESSION_STATE,
                      'ON CPU',
                      DECODE(SESSION_TYPE, 'BACKGROUND', 'BCPU', 'ON CPU'),
                      WAIT_CLASS) AS WAIT_CLASS
          FROM V$ACTIVE_SESSION_HISTORY
         WHERE SAMPLE_TIME > SYSDATE - INTERVAL '1'
         HOUR
           AND SAMPLE_TIME <= TRUNC(SYSDATE, 'MI')) ASH PIVOT(COUNT(*) 
  FOR WAIT_CLASS IN('ON CPU' AS CPU,'BCPU' AS BCPU,
'Scheduler' AS SCHEDULER,
'User I/O' AS UIO,
'System I/O' AS SIO, 
'Concurrency' AS CONCURRENCY,                                                                               
'Application' AS  APPLICATION,                                                                                  
'Commit' AS  COMMIT,                                                                             
'Configuration' AS CONFIGURATION,                     
'Administrative' AS   ADMINISTRATIVE,                                                                                 
'Network' AS  NETWORK,                                                                                 
'Queueing' AS   QUEUEING,                                                                                  
'Cluster' AS   CLUST,                                                                                      
'Other' AS  OTHER))
ORDER BY 1  ;



SELECT round(COUNT(*)/2) FROM V_$SESSION WHERE (STATUS = 'ACTIVE');

select * from V_$SESSION;

select
       substr(a.spid,1,9) pid,
       substr(b.sid,1,5) sid,
       substr(b.serial#,1,5) ser#,
       substr(b.machine,1,6) box,
       substr(b.username,1,10) username,
       b.server,
       substr(b.osuser,1,8) os_user,
       substr(b.program,1,30) program
from v$session b, v$process a
where
b.paddr = a.addr
and type='USER'
order by spid;