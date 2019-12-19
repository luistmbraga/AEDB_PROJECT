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

create sequence SESSION_C_Sq start with 1;
CREATE OR REPLACE TRIGGER SESSION_C_Tr
    BEFORE INSERT ON SESSION_COUNT
    FOR EACH ROW    
BEGIN
  :new.ID := SESSION_C_Sq.nextval;
END;


alter user grupo06 
QUOTA UNLIMITED ON AEBD_TP;