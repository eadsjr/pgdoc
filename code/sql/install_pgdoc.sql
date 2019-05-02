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
-- TODO: need to finish this
CREATE OR REPLACE FUNCTION generateSequence( type TEXT )
$$
DECLARE variable TEXT; -- example declaration
BEGIN
  variable := (SELECT /*example-query-here*/)
  CREATE SEQUENCE /*seq-name-goes-here*/
    AS integer
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;
  GRANT SELECT,USAGE ON SEQUENCE /*seq-name-goes-here*/ TO pgdoc;
END;
$$
LANGUAGE plpgsql;


-- TODO: all the rest
