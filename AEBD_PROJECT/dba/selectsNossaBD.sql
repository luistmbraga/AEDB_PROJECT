SELECT * FROM BASEDADOS;
SELECT * FROM CPU;
SELECT * FROM MEMORY;
SELECT * FROM TABLESPACES;
SELECT * FROM DATAFILES;

Select * From Users;

Select * From Sessions Order by ID;

Select * From Roles;

Select * From USERROLES;

Select * From PRIVILEGES;

Select * From USER_PRIVILEGES;

ALTER SYSTEM SET open_cursors = 1500 SCOPE=BOTH;