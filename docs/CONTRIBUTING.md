# Contributing to pg-doc

Thank you for your help! Feedback and suggestions are welcome.


## Code of Conduct

Please be polite and avoid unprofessional or inappropriate behavior when communicating with maintainers, contributors and users of this project. Report problematic or abusive behavior, with links or proof if available, to [Jason Eads (eadsjr)][contact-project-lead]. Violations can result in a suspension or permanent ban from this project.


## Questions, Suggestions and Bug Reports

First, [do a quick search][search-issues] to see if your issue is already known. If it is already present, comment on that issue rather then opening a new one.

Otherwise, [submit a new issue][new-issue]. Write a descriptive title, and extraploate further in the body text. When reporting a bug, list the steps required to reproduce the issue, if at all possible.

Please provide the version of PostgreSQL your are running, as well as the version of this library. You can find the version of this project you are using in the package.json file. Running `postgres -V` should print out the version information for PostgreSQL.


## Coordination and Documentation

All non-administrative communication about pg-doc deveopment should be in the form of code comments, git commit messages, [docs/TODO.md][todo-file] updates and [GitHub issues][search-issues]. Keep project related discussion and decision making out of chat and email to avoid losing context and history.


## Developement Goals

This project should require as little as possible from the user when it comes to understanding the domain of databases and interfacing with them via SQL or other means. You can expect them to know JSON, their programming language (such as Javascript), and IP address basics.

This project should provide users good usage examples for every feature.

This project should have tests for every feature that interacts with PostgreSQL and every function that the user is expected to call. Those tests should have as close to total coverage as feasible. They should all pass for supported versions before a stable release.

The code should be well commented with names that are expressive and accurate. Also, complex or non-obvious functions should have a leading comment describing their purpose, parameters, return values, and any error cases that may need to be handled.

The code should be tight and simple, don't sprawl too much in the core module. If a feature appears to be somewhat orthogonal to the libraries primary functions it can be made part of an extended optional feature set in a separate module, or a script.


## git Etiquette

Keep the commit history clean and legible, heavily favoring small code diffs. Keep a running history with branches checked in denoting the completion of notable blocks of commits.

Provide a message with every commit describing what the commit did. When appropriate, add a prefix "STABLE: " in front of messages for commits that leave the system in a good state for testing.

Branch names should be of the form '001_eadsjr_project_init', with a three digit number indicating the order of the branches you submitted, then username, then branch description in snake case.


[todo-file]:https://github.com/eadsjr/pg-doc/docs/TODO.md
[search-issues]:https://github.com/search?q=repo%3Aeadsjr%2Fpg-doc&type=Issues
[new-issue]:https://github.com/eadsjr/pg-doc/issues/new
[contact-project-lead]:mailto:jeads442@gamil.com