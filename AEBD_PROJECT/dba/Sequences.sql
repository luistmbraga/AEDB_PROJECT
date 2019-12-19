create sequence CPU_Sq start with 1;
CREATE OR REPLACE TRIGGER CPU_Tr
    BEFORE INSERT ON CPU
    FOR EACH ROW    
BEGIN
  :new.ID_C := CPU_Sq.nextval;
END;

create sequence Memory_Sq start with 1;
CREATE OR REPLACE TRIGGER Memory_Tr
    BEFORE INSERT ON MEMORY
    FOR EACH ROW    
BEGIN
  :new.ID_M := Memory_Sq.nextval;
END;

create sequence Sessions_Sq start with 1;
CREATE OR REPLACE TRIGGER SESSIONS_Tr
    BEFORE INSERT ON SESSIONS
    FOR EACH ROW    
BEGIN
  :new.ID := Sessions_Sq.nextval;
END;

CREATE OR REPLACE TRIGGER SESSION_Tr2
    BEFORE INSERT ON SESSIONS
    FOR EACH ROW
BEGIN
  Update SESSIONS SET ATUALIZADO = 0 
  WHERE ATUALIZADO = 1 and 
    abs(:new.timestamp - timestamp)*24*3600 > 1;
END;