--
-- This will eventually be the script that is run to set up the database initially for pgdoc
--

-- Create the database and connect to it
-- NOTE: This may be done in a separate script later
CREATE DATABASE pgdoc;
\c pgdoc

-- Create a user so the program can access the database without an admin account
CREATE ROLE pgdoc LOGIN;

CREATE SCHEMA pgdoc;
GRANT create,usage ON SCHEMA pgdoc TO pgdoc ;
-- TODO: write a script to do the above 2 lines for an arbitrary schema, an error message that explains the script AND gives these lines for the schema provided


-- Create the table that will store all user data
CREATE TABLE pgdoc.docs (
  type TEXT, -- Contains the type of document stored
  data JSONB -- Contains the document in JSON form
);
ALTER TABLE pgdoc.docs OWNER TO pgdoc;

-- Create role for game servers to register with
GRANT SELECT,INSERT,UPDATE ON TABLE pgdoc.docs TO pgdoc;

-- Create a named sequence when an ID is requested for the first time for a given document type.
CREATE OR REPLACE FUNCTION pgdoc.generateSequence( schemaName TEXT, type TEXT )
RETURNS TEXT AS
$$
DECLARE seqName TEXT;
BEGIN
  seqName := type || 'Sequence' ;
  EXECUTE 'CREATE SEQUENCE '
    || schemaName
    || '.'
    || seqName
    || ' AS integer '
    || 'START WITH 1 '
    || 'INCREMENT BY 1 '
    || 'MINVALUE 1 '
    || 'NO MAXVALUE '
    || 'CACHE 1;';
  EXECUTE 'GRANT SELECT,USAGE ON SEQUENCE ' || schemaName || '.' || seqName || ' TO pgdoc;';
  RETURN seqName;
END;
$$
LANGUAGE plpgsql;
ALTER FUNCTION pgdoc.generateSequence( TEXT, TEXT ) OWNER TO pgdoc;

-- Create a named sequence when an ID is requested for the first time for a given document type.
CREATE OR REPLACE FUNCTION pgdoc.incrementSequence( schemaName TEXT, type TEXT )
RETURNS TEXT AS
$$
DECLARE seqName TEXT;
DECLARE typeID  TEXT;
BEGIN
  seqName := schemaName || '.' || type || 'Sequence' ;
  IF
    (SELECT to_regclass(seqName))
  IS NULL
  THEN
    -- generate new sequence as needed
    PERFORM pgdoc.generateSequence(schemaName, type);
  END IF;
  typeID  := nextval( seqName )::TEXT ;
  RETURN typeID;
END;
$$
LANGUAGE plpgsql;

ALTER FUNCTION pgdoc.incrementSequence( TEXT, TEXT ) OWNER TO pgdoc;

-- required for the above function to succeed
-- GRANT create,usage ON SCHEMA public TO pgdoc ;


-- TODO: all the rest
