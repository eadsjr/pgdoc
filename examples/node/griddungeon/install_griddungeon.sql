-- install_griddungeon.sql

\c pgdoc

-- Create a user so the program can access the database without an admin account
CREATE ROLE griddungeon LOGIN;

-- Create a schema specific to this application and grant access to it
CREATE SCHEMA griddungeon;
GRANT create,usage ON SCHEMA griddungeon TO pgdoc ;
GRANT create,usage ON SCHEMA griddungeon TO griddungeon ;
GRANT usage ON SCHEMA pgdoc TO griddungeon ;
-- GRANT SELECT ON TABLE pgdoc.docs TO pgdoc;
-- GRANT EXECUTE ON FUNCTION pgdoc.generateSequence TO griddungeon;
GRANT EXECUTE ON FUNCTION pgdoc.incrementSequence TO griddungeon;
GRANT EXECUTE ON FUNCTION pgdoc.store TO griddungeon;
GRANT EXECUTE ON FUNCTION pgdoc.retrieve TO griddungeon;
GRANT EXECUTE ON FUNCTION pgdoc.delete TO griddungeon;

-- Create the table that will store all user data
CREATE TABLE griddungeon.docs (
  type TEXT, -- Contains the type of document stored
  data JSONB -- Contains the document in JSON form
);
ALTER TABLE docs OWNER TO griddungeon;

GRANT ALL ON TABLE griddungeon.docs TO pgdoc;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE griddungeon.docs TO griddungeon;

-- INSERT INTO griddungeon.docs VALUES ( 'test', '{ "a": 5 }' ) ;
-- SELECT * FROM griddungeon.docs ;