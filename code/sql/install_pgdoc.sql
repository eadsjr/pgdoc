--
-- This will eventually be the script that is run to set up the database initially for pg-doc
--

-- Create the database and connect to it
-- NOTE: This may be done in a separate script later
CREATE DATABASE pgdoc;
\c pgdoc

-- Create a user so the program can access the database without an admin account
CREATE ROLE pgdoc LOGIN;

-- Create the table that will store all user data
CREATE TABLE docs (
  type TEXT, -- Contains the type of document stored
  data JSONB -- Contains the document in JSON form
);
ALTER TABLE docs OWNER TO pgdoc;

-- Create role for game servers to register with
GRANT SELECT,INSERT,UPDATE ON TABLE docs TO pgdoc;

-- Create a named sequence when an ID is requested for the first time for a given document type.
CREATE OR REPLACE FUNCTION generateSequence( type TEXT )
RETURNS TEXT AS
$$
DECLARE seqName TEXT;
BEGIN
  seqName := type || 'Sequence' ;
  EXECUTE 'CREATE SEQUENCE '
    || quote_ident(seqName)
    || ' AS integer '
    || 'START WITH 1 '
    || 'INCREMENT BY 1 '
    || 'MINVALUE 1 '
    || 'NO MAXVALUE '
    || 'CACHE 1;';
  EXECUTE 'GRANT SELECT,USAGE ON SEQUENCE ' || quote_ident(seqName) || ' TO pgdoc;';
  RETURN seqName;
END;
$$
LANGUAGE plpgsql;

-- Create a named sequence when an ID is requested for the first time for a given document type.
CREATE OR REPLACE FUNCTION incrementSequence( schemaName TEXT, type TEXT )
RETURNS TEXT AS
$$
DECLARE seqName TEXT;
DECLARE typeID  TEXT;
BEGIN
  seqName := schemaName || '.' || type || 'Sequence' ;
  IF
    (SELECT to_regclass(quote_ident(seqName)))
  IS NULL
  THEN
    -- generate new sequence as needed
    PERFORM generateSequence(type);
  END IF;
  typeID  := nextval(quote_ident(seqName))::TEXT ;
  RETURN typeID;
END;
$$
LANGUAGE plpgsql;

-- required for the above function to succeed
GRANT create ON SCHEMA public TO pgdoc ;

CREATE SCHEMA pgdoc;
GRANT create,usage ON SCHEMA pgdoc TO pgdoc ;
-- TODO: write a script to do the above 2 lines for an arbitrary schema, an error message that explains the script AND gives these lines for the schema provided

-- TODO: all the rest
