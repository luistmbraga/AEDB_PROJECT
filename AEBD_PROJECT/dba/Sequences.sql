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